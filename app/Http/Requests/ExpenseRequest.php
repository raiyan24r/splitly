<?php

namespace App\Http\Requests;

use App\Models\Expense;
use App\Models\Group;
use App\Services\SplitCalculator;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

class ExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'description' => ['required', 'string', 'max:120'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:99999999'],
            'category' => ['required', Rule::in(Expense::CATEGORIES)],
            'spent_at' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'split_type' => ['required', Rule::in(SplitCalculator::TYPES)],
            'payers' => ['required', 'array', 'min:1'],
            'payers.*.member_id' => ['required', 'integer', 'distinct', $this->activeMember()],
            'payers.*.amount' => ['nullable', 'numeric', 'min:0'],
            'splits' => ['required', 'array', 'min:1'],
            'splits.*.member_id' => ['required', 'integer', 'distinct', $this->activeMember()],
            'splits.*.value' => ['nullable', 'numeric'],
            // Receipt uploads are temporarily disabled; restore the commented rule to re-enable.
            'receipt' => ['prohibited'],
            // 'receipt' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,heic,heif,pdf', 'max:5120'],
            'remove_receipt' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'payers.*.member_id.exists' => 'One of the payers is no longer in this group.',
            'splits.*.member_id.exists' => 'One of the people in the split is no longer in this group.',
            'receipt.max' => 'Receipts can be at most 5 MB.',
            'receipt.prohibited' => 'Receipt uploads are temporarily disabled.',
        ];
    }

    /**
     * The validated input in the shape SaveExpense expects.
     *
     * @return array{
     *     description: string,
     *     amount: string,
     *     category: string,
     *     spent_at: string,
     *     notes: string|null,
     *     split_type: string,
     *     payers: list<array{member_id: int, amount: string|null}>,
     *     splits: list<array{member_id: int, value: string|null}>,
     *     remove_receipt: bool,
     * }
     */
    public function expenseData(): array
    {
        return [
            'description' => $this->string('description')->trim()->toString(),
            'amount' => $this->string('amount')->toString(),
            'category' => $this->string('category')->toString(),
            // The browser sends an ISO instant in the viewer's timezone; store it as app-timezone wall-clock time.
            'spent_at' => CarbonImmutable::parse($this->string('spent_at')->toString())
                ->setTimezone(config('app.timezone'))
                ->format('Y-m-d H:i:s'),
            'notes' => $this->filled('notes') ? $this->string('notes')->toString() : null,
            'split_type' => $this->string('split_type')->toString(),
            'payers' => array_map(
                fn (array $row) => ['member_id' => $row['member_id'], 'amount' => $row['value']],
                $this->rows('payers', 'amount'),
            ),
            'splits' => $this->rows('splits', 'value'),
            'remove_receipt' => $this->boolean('remove_receipt'),
        ];
    }

    /**
     * Normalise validated payer / split rows into [member_id, value] pairs.
     *
     * @return list<array{member_id: int, value: string|null}>
     */
    private function rows(string $key, string $valueKey): array
    {
        $rows = [];

        foreach ((array) $this->validated($key) as $row) {
            $value = is_array($row) ? ($row[$valueKey] ?? null) : null;

            $rows[] = [
                'member_id' => is_array($row) && is_numeric($row['member_id']) ? (int) $row['member_id'] : 0,
                'value' => is_scalar($value) && $value !== '' ? (string) $value : null,
            ];
        }

        return $rows;
    }

    private function activeMember(): Exists
    {
        /** @var Group $group */
        $group = $this->route('group');

        return Rule::exists('members', 'id')
            ->where('group_id', $group->id)
            ->whereNull('deleted_at');
    }
}
