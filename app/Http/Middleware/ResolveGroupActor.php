<?php

namespace App\Http\Middleware;

use App\Models\Group;
use App\Support\CurrentMember;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ResolveGroupActor
{
    public function __construct(private CurrentMember $current) {}

    /**
     * Work out which member is acting (from the X-Member-Id header the browser
     * keeps in localStorage) and block changes when nobody has been picked.
     *
     * Modes:
     *  - "required" (default): changes group data, needs a picked member.
     *  - "optional": changes group data, but a newcomer may not have picked yet.
     *  - "read": only resolves the member for the audit log (logout, switching
     *    identity), so it also works in archived groups.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $mode = 'required'): Response
    {
        $group = $request->route('group');

        abort_unless($group instanceof Group, 404);

        $memberId = $request->header('X-Member-Id');

        // Always assign, so nothing carries over between requests in long-lived workers.
        $this->current->member = is_numeric($memberId)
            ? $group->members()->whereKey((int) $memberId)->first()
            : null;

        if ($mode === 'read') {
            return $next($request);
        }

        $isAdmin = $request->user() !== null;

        if ($group->isArchived() && ! $isAdmin) {
            return $this->reject('This group is archived and can no longer be changed.');
        }

        if ($mode === 'required' && $this->current->member === null && ! $isAdmin) {
            return $this->reject('Pick who you are first.');
        }

        return $next($request);
    }

    private function reject(string $message): Response
    {
        Inertia::flash('toast', ['type' => 'error', 'message' => $message]);

        return back();
    }
}
