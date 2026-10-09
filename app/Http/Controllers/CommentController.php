<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpenseComment;
use App\Models\Group;
use App\Services\AuditLogger;
use App\Support\CurrentMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CommentController extends Controller
{
    public function store(Request $request, Group $group, Expense $expense, AuditLogger $audit, CurrentMember $current): RedirectResponse
    {
        $data = $request->validate(['body' => ['required', 'string', 'max:1000']]);

        $comment = $expense->comments()->create([
            'member_id' => $current->member?->id,
            'author_name' => $current->member->name ?? ($request->user()?->name.' (admin)'),
            'body' => trim($data['body']),
        ]);

        $audit->log($group, 'comment.added', "Commented on \"{$expense->description}\": ".Str::limit($comment->body, 80), $expense);

        return back();
    }

    public function destroy(Group $group, Expense $expense, ExpenseComment $comment, AuditLogger $audit): RedirectResponse
    {
        $comment->delete();

        $audit->log($group, 'comment.deleted', "Deleted a comment on \"{$expense->description}\": ".Str::limit($comment->body, 80), $expense, [
            'comment' => ['from' => $comment->body, 'to' => null],
        ]);

        return back();
    }
}
