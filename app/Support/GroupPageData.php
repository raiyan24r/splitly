<?php

namespace App\Support;

use App\Models\AuditLog;
use App\Models\Expense;
use App\Models\ExpenseComment;
use App\Models\ExpensePayer;
use App\Models\ExpenseSplit;
use App\Models\Group;
use App\Models\Member;
use App\Models\Payment;
use App\Services\BalanceCalculator;

/**
 * Builds the props for the group page.
 */
class GroupPageData
{
    private const ACTIVITY_LIMIT = 200;

    public function __construct(private BalanceCalculator $balances) {}

    /**
     * @return array<string, mixed>
     */
    public function build(Group $group, bool $isAdmin): array
    {
        return [
            'group' => [
                'id' => $group->id,
                'slug' => $group->slug,
                'name' => $group->name,
                'description' => $group->description,
                'currency' => $group->currency,
                'exponent' => Money::exponent($group->currency),
                'simplify_debts' => $group->simplify_debts,
                'archived' => $group->isArchived(),
                'url' => route('groups.show', $group),
            ],
            'members' => $group->members()->withTrashed()->get()->map(fn (Member $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'color' => $m->color,
                'removed' => $m->trashed(),
            ]),
            'expenses' => $group->expenses()
                ->with(['payers', 'splits', 'comments', 'creator'])
                ->orderByDesc('spent_at')
                ->orderByDesc('id')
                ->get()
                ->map(fn (Expense $e) => $this->expense($group, $e)),
            'payments' => $group->payments()
                ->orderByDesc('paid_at')
                ->orderByDesc('id')
                ->get()
                ->map(fn (Payment $p) => [
                    'id' => $p->id,
                    'from' => $p->from_member_id,
                    'to' => $p->to_member_id,
                    'amount' => $p->amount,
                    'paid_at' => $p->paid_at->toIso8601String(),
                    'note' => $p->note,
                    'created_at' => $p->created_at?->toIso8601String(),
                ]),
            'deletedExpenses' => $group->expenses()
                ->onlyTrashed()
                ->latest('deleted_at')
                ->limit(30)
                ->get(['id', 'description', 'amount', 'deleted_at'])
                ->map(fn (Expense $e) => [
                    'id' => $e->id,
                    'description' => $e->description,
                    'amount' => $e->amount,
                    'deleted_at' => $e->deleted_at?->toIso8601String(),
                ]),
            'activity' => $this->activity($group),
            'balances' => $this->balances->forGroup($group),
            'categories' => Expense::CATEGORIES,
            'isAdmin' => $isAdmin,
        ];
    }

    /**
     * Recent audit entries, each with the device it came from and the names
     * that device had used in this group up to then.
     *
     * @return list<array<string, mixed>>
     */
    private function activity(Group $group): array
    {
        $logs = $group->auditLogs()->latest('id')->limit(self::ACTIVITY_LIMIT)->get();
        $trails = DeviceTrail::for($logs);

        return array_values($logs->map(fn (AuditLog $log) => [
            'id' => $log->id,
            'actor_name' => $log->actor_name,
            'actor_member_id' => $log->actor_member_id,
            'action' => $log->action,
            'description' => $log->description,
            'subject_type' => $log->subject_type,
            'subject_id' => $log->subject_id,
            'device' => Device::label($log->user_agent),
            'device_tag' => Device::tag($log->device_id),
            'device_trail' => $trails[$log->id] ?? [],
            'created_at' => $log->created_at->toIso8601String(),
        ])->all());
    }

    /**
     * @return array<string, mixed>
     */
    private function expense(Group $group, Expense $e): array
    {
        return [
            'id' => $e->id,
            'description' => $e->description,
            'amount' => $e->amount,
            'category' => $e->category,
            'spent_at' => $e->spent_at->toIso8601String(),
            'split_type' => $e->split_type,
            'notes' => $e->notes,
            'receipt_url' => $e->receipt_path
                ? route('groups.expenses.receipt', [$group, $e])
                : null,
            'receipt_is_pdf' => $e->receipt_path !== null && str_ends_with(strtolower($e->receipt_path), '.pdf'),
            'created_by' => $e->creator?->name,
            'created_at' => $e->created_at?->toIso8601String(),
            'updated_at' => $e->updated_at?->toIso8601String(),
            'payers' => $e->payers->map(fn (ExpensePayer $p) => [
                'member_id' => $p->member_id,
                'amount' => $p->amount,
            ]),
            'splits' => $e->splits->map(fn (ExpenseSplit $s) => [
                'member_id' => $s->member_id,
                'amount' => $s->amount,
                'input_value' => $s->input_value,
            ]),
            'comments' => $e->comments->map(fn (ExpenseComment $c) => [
                'id' => $c->id,
                'member_id' => $c->member_id,
                'author_name' => $c->author_name,
                'body' => $c->body,
                'created_at' => $c->created_at?->toIso8601String(),
            ]),
        ];
    }
}
