<?php

namespace App\Http\Controllers;

use App\Actions\SaveExpense;
use App\Http\Requests\ExpenseRequest;
use App\Models\Expense;
use App\Models\Group;
use App\Services\AuditLogger;
use App\Support\CurrentMember;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExpenseController extends Controller
{
    public function store(ExpenseRequest $request, Group $group, SaveExpense $save): RedirectResponse
    {
        $expense = $save->handle($group, null, $request->expenseData(), $request->file('receipt'));

        Inertia::flash('toast', ['type' => 'success', 'message' => "Added \"{$expense->description}\""]);

        return back();
    }

    public function update(ExpenseRequest $request, Group $group, Expense $expense, SaveExpense $save): RedirectResponse
    {
        $save->handle($group, $expense, $request->expenseData(), $request->file('receipt'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Expense updated']);

        return back();
    }

    /**
     * Enters how much of a claim expense someone owes. Usually people claim
     * their own share, but anyone in the group can set or fix someone else's.
     */
    public function claim(Request $request, Group $group, Expense $expense, CurrentMember $current, AuditLogger $audit): RedirectResponse
    {
        $request->validate([
            'amount' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'member_id' => ['nullable', 'integer'],
        ]);

        $actor = $current->member;
        $amount = Money::toMinor($request->string('amount')->toString(), $group->currency);

        if (! $expense->isClaim() || $actor === null) {
            throw ValidationException::withMessages(['amount' => 'You can not claim a share of this expense.']);
        }

        $member = $request->filled('member_id')
            ? $group->members()->find($request->integer('member_id'))
            : $actor;
        $self = $member?->is($actor);

        DB::transaction(function () use ($expense, $member, $self, $amount, $group) {
            $splits = $expense->splits()->lockForUpdate()->get();
            $split = $member ? $splits->firstWhere('member_id', $member->id) : null;

            if ($split === null) {
                throw ValidationException::withMessages([
                    'amount' => $self ? 'You are not part of this expense.' : 'They are not part of this expense.',
                ]);
            }

            $left = $expense->amount - (int) $splits->where('id', '!=', $split->id)->sum('amount');

            if ($amount > $left) {
                throw ValidationException::withMessages([
                    'amount' => 'Only '.Money::format($left, $group->currency).' is left to claim.',
                ]);
            }

            $split->update(['amount' => $amount, 'input_value' => Money::toDecimal($amount, $group->currency)]);
        });

        $formatted = Money::format($amount, $group->currency);

        if ($self) {
            $audit->log($group, 'expense.claimed', "Claimed {$formatted} of \"{$expense->description}\"", $expense);
            Inertia::flash('toast', ['type' => 'success', 'message' => "Saved your share of \"{$expense->description}\""]);
        } else {
            $audit->log($group, 'expense.claimed', "Set {$member->name}'s share of \"{$expense->description}\" to {$formatted}", $expense);
            Inertia::flash('toast', ['type' => 'success', 'message' => "Saved {$member->name}'s share of \"{$expense->description}\""]);
        }

        return back();
    }

    public function destroy(Group $group, Expense $expense, AuditLogger $audit): RedirectResponse
    {
        $expense->delete();

        $audit->log($group, 'expense.deleted', "Deleted \"{$expense->description}\" (".Money::format($expense->amount, $group->currency).')', $expense);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Deleted \"{$expense->description}\"",
            'undo' => route('groups.expenses.restore', [$group, $expense->id]),
        ]);

        return back();
    }

    public function restore(Group $group, int $expense, AuditLogger $audit): RedirectResponse
    {
        $expense = $group->expenses()->onlyTrashed()->with('payers', 'splits')->findOrFail($expense);

        $involved = $expense->payers->pluck('member_id')->merge($expense->splits->pluck('member_id'))->unique();
        $removed = $group->members()->onlyTrashed()->whereIn('id', $involved)->pluck('name');

        if ($removed->isNotEmpty()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "Can't restore: {$removed->join(', ', ' and ')} left the group.",
            ]);

            return back();
        }

        $expense->restore();

        $audit->log($group, 'expense.restored', "Restored \"{$expense->description}\" (".Money::format($expense->amount, $group->currency).')', $expense);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Restored \"{$expense->description}\""]);

        return back();
    }

    public function receipt(Group $group, Expense $expense): StreamedResponse
    {
        abort_unless($expense->receipt_path && Storage::disk('local')->exists($expense->receipt_path), 404);

        return Storage::disk('local')->response($expense->receipt_path, null, [
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }
}
