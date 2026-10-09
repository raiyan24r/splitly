<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Member;
use App\Services\AuditLogger;
use App\Services\BalanceCalculator;
use App\Support\CurrentMember;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;
use Inertia\Inertia;

class MemberController extends Controller
{
    public function store(Request $request, Group $group, AuditLogger $audit, CurrentMember $current): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:60', $this->uniqueName($group)],
            'join' => ['sometimes', 'boolean'],
        ], ['name.unique' => 'Someone with that name is already in the group.']);

        $member = $group->members()->create([
            'name' => trim($data['name']),
            'color' => Member::nextColorFor($group),
        ]);

        // Someone adding themselves from "Who are you?" is the actor of their own join.
        if ($request->boolean('join') && $current->member === null) {
            $current->member = $member;
            $audit->log($group, 'member.joined', 'Joined the group', $member);
        } else {
            $audit->log($group, 'member.added', "Added {$member->name} to the group", $member);
        }

        Inertia::flash('member', ['id' => $member->id]);

        return back();
    }

    public function update(Request $request, Group $group, Member $member, AuditLogger $audit): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:60', $this->uniqueName($group)->ignore($member->id)],
        ], ['name.unique' => 'Someone with that name is already in the group.']);

        $old = $member->name;
        $member->update(['name' => trim($data['name'])]);

        if ($old !== $member->name) {
            $audit->log($group, 'member.renamed', "Renamed {$old} to {$member->name}", $member, [
                'name' => ['from' => $old, 'to' => $member->name],
            ]);
        }

        return back();
    }

    public function destroy(Group $group, Member $member, AuditLogger $audit, BalanceCalculator $balances): RedirectResponse
    {
        $balance = $balances->forGroup($group)['net'][$member->id] ?? 0;

        if ($balance !== 0) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "{$member->name} still has a balance of ".Money::format($balance, $group->currency).'. Settle up first.',
            ]);

            return back();
        }

        $member->delete();

        $audit->log($group, 'member.removed', "Removed {$member->name} from the group", $member);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Removed {$member->name}"]);

        return back();
    }

    private function uniqueName(Group $group): Unique
    {
        return Rule::unique('members', 'name')
            ->where('group_id', $group->id)
            ->whereNull('deleted_at');
    }
}
