<?php

namespace App\Http\Controllers;

use App\Actions\SaveExpense;
use App\Http\Requests\ExpenseRequest;
use App\Models\Expense;
use App\Models\Group;
use App\Services\AuditLogger;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
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
