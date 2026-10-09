<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Services\AuditLogger;
use App\Support\CurrentMember;
use App\Support\GroupAccess;
use App\Support\GroupPageData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    private const MAX_ATTEMPTS = 5;

    /**
     * Show the group, or its password screen if this browser hasn't unlocked it yet.
     */
    public function show(Request $request, Group $group, GroupPageData $data): Response
    {
        if (! GroupAccess::has($request, $group)) {
            return Inertia::render('groups/unlock', [
                'group' => ['name' => $group->name, 'slug' => $group->slug],
            ]);
        }

        return Inertia::render('groups/show', $data->build($group, $request->user() !== null));
    }

    public function unlock(Request $request, Group $group, AuditLogger $audit): RedirectResponse
    {
        $request->validate(['password' => ['required', 'string', 'max:255']]);

        $key = 'group-unlock:'.$group->id.'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, self::MAX_ATTEMPTS)) {
            throw ValidationException::withMessages([
                'password' => 'Too many attempts. Try again in '.RateLimiter::availableIn($key).' seconds.',
            ]);
        }

        if (! Hash::check((string) $request->input('password'), $group->password)) {
            RateLimiter::hit($key, 60);
            $audit->log($group, 'group.unlock_failed', 'Wrong group password entered');

            throw ValidationException::withMessages(['password' => 'That password is not right.']);
        }

        RateLimiter::clear($key);
        GroupAccess::grant($request, $group);
        $audit->log($group, 'group.unlocked', 'Opened the group on a new device');

        return redirect()->route('groups.show', $group);
    }

    /**
     * Log out of the group on this device: the password will be asked again next time.
     */
    public function lock(Request $request, Group $group, AuditLogger $audit): RedirectResponse
    {
        $audit->log($group, 'group.logged_out', 'Logged out on this device');

        GroupAccess::revoke($request, $group);

        return redirect()->route('groups.show', $group);
    }

    /**
     * Record who this device says it is. The choice itself lives in the
     * browser's localStorage; this only leaves a trail in the audit log.
     * The X-Member-Id header still carries the previous identity here.
     */
    public function identify(Request $request, Group $group, AuditLogger $audit, CurrentMember $current): RedirectResponse
    {
        $request->validate([
            'member_id' => [
                'required',
                'integer',
                Rule::exists('members', 'id')->where('group_id', $group->id)->whereNull('deleted_at'),
            ],
        ]);

        $chosen = $group->members()->whereKey($request->integer('member_id'))->firstOrFail();
        $previous = $current->member;

        if ($previous === null) {
            $current->member = $chosen;
            $audit->log($group, 'identity.selected', 'Picked their name on this device', $chosen);
        } elseif (! $previous->is($chosen)) {
            $audit->log($group, 'identity.switched', "Switched this device to {$chosen->name}", $chosen, [
                'member' => ['from' => $previous->name, 'to' => $chosen->name],
            ]);
        }

        return back();
    }

    public function updateSettings(Request $request, Group $group, AuditLogger $audit): RedirectResponse
    {
        $data = $request->validate(['simplify_debts' => ['required', 'boolean']]);

        if ($group->simplify_debts !== (bool) $data['simplify_debts']) {
            $group->update($data);

            $audit->log(
                $group,
                'group.settings_updated',
                ($group->simplify_debts ? 'Turned on' : 'Turned off').' simplify debts',
                $group,
                ['simplify_debts' => ['from' => ! $group->simplify_debts, 'to' => $group->simplify_debts]],
            );
        }

        return back();
    }
}
