<?php

namespace App\Actions;

use App\Models\Expense;
use App\Models\Group;
use App\Services\AuditLogger;
use App\Services\SplitCalculator;
use App\Services\SplitException;
use App\Support\CurrentMember;
use App\Support\Money;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class SaveExpense
{
    public function __construct(
        private SplitCalculator $calculator,
        private AuditLogger $audit,
        private CurrentMember $current,
    ) {}

    /**
     * Create or update an expense from validated input.
     *
     * @param  array{
     *     description: string,
     *     amount: string,
     *     category: string,
     *     spent_at: string,
     *     notes?: string|null,
     *     split_type: string,
     *     payers: list<array{member_id: int, amount: string|null}>,
     *     splits: list<array{member_id: int, value: string|null}>,
     *     remove_receipt: bool,
     * }  $data
     */
    public function handle(Group $group, ?Expense $expense, array $data, ?UploadedFile $receipt = null): Expense
    {
        $currency = $group->currency;
        $total = Money::toMinor($data['amount'], $currency);

        $payers = $this->payers($data['payers'], $total, $currency);
        $splits = $data['split_type'] === SplitCalculator::CLAIM
            ? $this->claimSplits($expense, $data['splits'], $total, $currency)
            : $this->splits($data['split_type'], $data['splits'], $total, $currency);

        $before = $expense?->auditSnapshot();
        $oldReceipt = $expense?->receipt_path;

        $expense = DB::transaction(function () use ($group, $expense, $data, $total, $payers, $splits, $receipt) {
            $expense ??= new Expense(['created_by_member_id' => $this->current->member?->id]);
            $expense->group()->associate($group);

            $expense->fill([
                'description' => trim($data['description']),
                'amount' => $total,
                'category' => $data['category'],
                'spent_at' => $data['spent_at'],
                'notes' => $data['notes'] ?? null,
                'split_type' => $data['split_type'],
            ]);

            if ($receipt) {
                $path = $receipt->store("receipts/{$group->id}", 'local');

                if ($path === false) {
                    throw ValidationException::withMessages(['receipt' => 'The receipt could not be saved. Please try again.']);
                }

                $expense->receipt_path = $path;
            } elseif ($data['remove_receipt']) {
                $expense->receipt_path = null;
            }

            $expense->save();

            $expense->payers()->delete();
            $expense->payers()->createMany(
                collect($payers)->map(fn ($amount, $memberId) => ['member_id' => $memberId, 'amount' => $amount])->values()->all()
            );

            $expense->splits()->delete();
            $expense->splits()->createMany($splits);

            return $expense->unsetRelation('payers')->unsetRelation('splits');
        });

        if ($oldReceipt && $oldReceipt !== $expense->receipt_path) {
            Storage::disk('local')->delete($oldReceipt);
        }

        $amount = Money::format($total, $currency);

        if ($before === null) {
            $this->audit->log($group, 'expense.created', "Added \"{$expense->description}\" ({$amount})", $expense, [
                'after' => $expense->auditSnapshot(),
            ]);
        } else {
            $changes = AuditLogger::diff($before, $expense->auditSnapshot());

            if ($changes !== []) {
                $fields = implode(', ', array_map(fn ($k) => str_replace('_', ' ', $k), array_keys($changes)));
                $this->audit->log($group, 'expense.updated', "Edited \"{$expense->description}\" ({$fields})", $expense, $changes);
            }
        }

        return $expense;
    }

    /**
     * @param  list<array{member_id: int, amount: string|null}>  $payers
     * @return array<int, int>
     */
    private function payers(array $payers, int $total, string $currency): array
    {
        if (count($payers) === 1) {
            return [$payers[0]['member_id'] => $total];
        }

        $amounts = [];

        foreach ($payers as $payer) {
            $amount = Money::toMinor($payer['amount'], $currency);

            if ($amount > 0) {
                $amounts[$payer['member_id']] = ($amounts[$payer['member_id']] ?? 0) + $amount;
            }
        }

        if ($amounts === [] || array_sum($amounts) !== $total) {
            throw ValidationException::withMessages([
                'payers' => 'What each person paid must add up to the total.',
            ]);
        }

        return $amounts;
    }

    /**
     * Claim expenses: a row with a value claims that much for the person right
     * away. A row without one keeps whatever they have already claimed, or
     * leaves them to claim later.
     *
     * @param  list<array{member_id: int, value: string|null}>  $rows
     * @return list<array{member_id: int, amount: int, input_value: string|null}>
     */
    private function claimSplits(?Expense $expense, array $rows, int $total, string $currency): array
    {
        $existing = $expense?->isClaim() ? $expense->splits->keyBy('member_id') : collect();
        $result = [];

        foreach ($rows as $row) {
            if ($row['value'] !== null) {
                $amount = Money::toMinor($row['value'], $currency);

                if ($amount < 0) {
                    throw ValidationException::withMessages(['splits' => 'A claim can not be negative.']);
                }

                $result[] = [
                    'member_id' => $row['member_id'],
                    'amount' => $amount,
                    'input_value' => Money::toDecimal($amount, $currency),
                ];

                continue;
            }

            $claim = $existing->get($row['member_id']);

            $result[] = [
                'member_id' => $row['member_id'],
                'amount' => $claim->amount ?? 0,
                'input_value' => $claim?->input_value,
            ];
        }

        $claimed = array_sum(array_column($result, 'amount'));

        if ($claimed > $total) {
            throw ValidationException::withMessages([
                'splits' => 'Claims add up to '.Money::format($claimed, $currency).', more than this total.',
            ]);
        }

        return $result;
    }

    /**
     * @param  list<array{member_id: int, value: string|null}>  $rows
     * @return list<array{member_id: int, amount: int, input_value: string|null}>
     */
    private function splits(string $type, array $rows, int $total, string $currency): array
    {
        $inMinorUnits = in_array($type, [SplitCalculator::EXACT, SplitCalculator::ADJUSTMENT], true);
        $inputs = [];
        $raw = [];

        foreach ($rows as $row) {
            $raw[$row['member_id']] = $row['value'];
            $inputs[$row['member_id']] = $inMinorUnits
                ? Money::toMinor($row['value'], $currency)
                : (float) $row['value'];
        }

        try {
            $owed = $this->calculator->split($total, $type, $inputs);
        } catch (SplitException $e) {
            throw ValidationException::withMessages(['splits' => $e->getMessage()]);
        }

        $result = [];

        foreach ($owed as $memberId => $amount) {
            $value = $raw[$memberId] ?? null;

            $result[] = [
                'member_id' => $memberId,
                'amount' => $amount,
                'input_value' => $type === SplitCalculator::EQUAL || $value === null || $value === '' ? null : $value,
            ];
        }

        return $result;
    }
}
