<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Member;
use App\Models\Payment;
use App\Services\AuditLogger;
use App\Support\CurrentMember;
use App\Support\Money;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function store(Request $request, Group $group, AuditLogger $audit, CurrentMember $current): RedirectResponse
    {
        $data = $this->validated($request, $group);

        $payment = $group->payments()->create([
            ...$data,
            'created_by_member_id' => $current->member?->id,
        ]);

        $audit->log($group, 'payment.created', $this->describe($group, 'Recorded', $payment), $payment, [
            'after' => $payment->auditSnapshot(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Payment recorded']);

        return back();
    }

    public function update(Request $request, Group $group, Payment $payment, AuditLogger $audit): RedirectResponse
    {
        $before = $payment->auditSnapshot();
        $payment->update($this->validated($request, $group));
        $changes = AuditLogger::diff($before, $payment->auditSnapshot());

        if ($changes !== []) {
            $audit->log($group, 'payment.updated', $this->describe($group, 'Edited payment', $payment), $payment, $changes);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Payment updated']);

        return back();
    }

    public function destroy(Group $group, Payment $payment, AuditLogger $audit): RedirectResponse
    {
        $payment->delete();

        $audit->log($group, 'payment.deleted', $this->describe($group, 'Deleted payment', $payment), $payment);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Payment deleted']);

        return back();
    }

    /**
     * @return array{from_member_id: int, to_member_id: int, paid_by_member_id: int|null, owes_payer_back: bool, amount: int, paid_at: string, note: string|null}
     */
    private function validated(Request $request, Group $group): array
    {
        $member = Rule::exists('members', 'id')->where('group_id', $group->id)->whereNull('deleted_at');

        $data = $request->validate([
            'from_member_id' => ['required', 'integer', $member],
            'to_member_id' => ['required', 'integer', 'different:from_member_id', $member],
            // Someone else paying on from_member_id's behalf.
            'paid_by_member_id' => ['nullable', 'integer', 'different:from_member_id', 'different:to_member_id', $member],
            'owes_payer_back' => ['boolean'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:99999999'],
            'paid_at' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
        ], [
            'to_member_id.different' => 'Pick two different people.',
            'paid_by_member_id.different' => 'Whoever paid on their behalf must be someone else.',
        ]);

        $paidBy = isset($data['paid_by_member_id']) ? (int) $data['paid_by_member_id'] : null;

        return [
            'from_member_id' => (int) $data['from_member_id'],
            'to_member_id' => (int) $data['to_member_id'],
            'paid_by_member_id' => $paidBy,
            'owes_payer_back' => $paidBy !== null && $request->boolean('owes_payer_back'),
            'amount' => Money::toMinor($data['amount'], $group->currency),
            // The browser sends an ISO instant in the viewer's timezone; store it as app-timezone wall-clock time.
            'paid_at' => CarbonImmutable::parse($data['paid_at'])
                ->setTimezone(config('app.timezone'))
                ->format('Y-m-d H:i:s'),
            'note' => $data['note'] ?? null,
        ];
    }

    private function describe(Group $group, string $verb, Payment $payment): string
    {
        $names = Member::withTrashed()
            ->whereIn('id', array_filter([$payment->from_member_id, $payment->to_member_id, $payment->paid_by_member_id]))
            ->pluck('name', 'id');
        $from = $names[$payment->from_member_id] ?? '?';
        $to = $names[$payment->to_member_id] ?? '?';
        $amount = Money::format($payment->amount, $group->currency);

        if ($payment->paid_by_member_id === null) {
            return "{$verb}: {$from} paid {$to} {$amount}";
        }

        $paidBy = $names[$payment->paid_by_member_id] ?? '?';

        return "{$verb}: {$paidBy} paid {$to} {$amount} for {$from}"
            .($payment->owes_payer_back ? ", {$from} pays {$paidBy} back" : '');
    }
}
