<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Group;
use App\Models\Member;
use App\Models\Payment;
use Illuminate\Support\Collection;

class BalanceCalculator
{
    public function __construct(private DebtSimplifier $simplifier) {}

    /**
     * @return array{
     *     net: array<int, int>,
     *     paid: array<int, int>,
     *     share: array<int, int>,
     *     pairwise: list<array{from: int, to: int, amount: int}>,
     *     simplified: list<array{from: int, to: int, amount: int}>,
     *     total_spent: int,
     * }
     */
    public function forGroup(Group $group): array
    {
        $expenses = $group->expenses()->with('payers', 'splits')->get();
        $payments = $group->payments()->get();

        $memberIds = $group->members()->withTrashed()->get()->map(fn (Member $m) => $m->id)->values()->all();

        return $this->calculate($expenses, $payments, $memberIds);
    }

    /**
     * @param  Collection<int, Expense>  $expenses
     * @param  Collection<int, Payment>  $payments
     * @param  array<int, int>  $memberIds
     * @return array{
     *     net: array<int, int>,
     *     paid: array<int, int>,
     *     share: array<int, int>,
     *     pairwise: list<array{from: int, to: int, amount: int}>,
     *     simplified: list<array{from: int, to: int, amount: int}>,
     *     total_spent: int,
     * }
     */
    public function calculate(Collection $expenses, Collection $payments, array $memberIds): array
    {
        $net = array_fill_keys($memberIds, 0);
        $paid = $net;
        $share = $net;

        // $owes[$debtor][$creditor] = amount
        $owes = [];

        foreach ($expenses as $expense) {
            $payerWeights = $expense->payers->mapWithKeys(fn ($p) => [$p->member_id => $p->amount])->all();

            foreach ($expense->payers as $payer) {
                $paid[$payer->member_id] = ($paid[$payer->member_id] ?? 0) + $payer->amount;
                $net[$payer->member_id] = ($net[$payer->member_id] ?? 0) + $payer->amount;
            }

            foreach ($expense->owedShares() as $memberId => $owed) {
                $share[$memberId] = ($share[$memberId] ?? 0) + $owed;
                $net[$memberId] = ($net[$memberId] ?? 0) - $owed;

                if ($owed <= 0 || $payerWeights === []) {
                    continue;
                }

                // Each person's share is owed to the payers in proportion to what they paid.
                foreach (SplitCalculator::allocate($owed, $payerWeights) as $payerId => $amount) {
                    if ($payerId !== $memberId) {
                        $owes[$memberId][$payerId] = ($owes[$memberId][$payerId] ?? 0) + $amount;
                    }
                }
            }
        }

        foreach ($payments as $payment) {
            $net[$payment->from_member_id] = ($net[$payment->from_member_id] ?? 0) + $payment->amount;
            $net[$payment->to_member_id] = ($net[$payment->to_member_id] ?? 0) - $payment->amount;

            // Paying someone is the same as them now owing you that amount back.
            $owes[$payment->to_member_id][$payment->from_member_id] =
                ($owes[$payment->to_member_id][$payment->from_member_id] ?? 0) + $payment->amount;
        }

        return [
            'net' => $net,
            'paid' => $paid,
            'share' => $share,
            'pairwise' => $this->netPairs($owes),
            'simplified' => $this->simplifier->simplify($net),
            'total_spent' => (int) $expenses->sum('amount'),
        ];
    }

    /**
     * @param  array<int, array<int, int>>  $owes
     * @return list<array{from: int, to: int, amount: int}>
     */
    private function netPairs(array $owes): array
    {
        $pairs = [];
        $seen = [];

        foreach ($owes as $a => $creditors) {
            foreach ($creditors as $b => $amount) {
                $key = min($a, $b).'-'.max($a, $b);

                if (isset($seen[$key])) {
                    continue;
                }

                $seen[$key] = true;
                $diff = $amount - ($owes[$b][$a] ?? 0);

                if ($diff > 0) {
                    $pairs[] = ['from' => $a, 'to' => $b, 'amount' => $diff];
                } elseif ($diff < 0) {
                    $pairs[] = ['from' => $b, 'to' => $a, 'amount' => -$diff];
                }
            }
        }

        usort($pairs, fn ($x, $y) => $y['amount'] <=> $x['amount']);

        return $pairs;
    }
}
