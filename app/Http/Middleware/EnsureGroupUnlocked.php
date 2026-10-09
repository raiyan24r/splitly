<?php

namespace App\Http\Middleware;

use App\Models\Group;
use App\Support\GroupAccess;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureGroupUnlocked
{
    /**
     * Only let through browsers that entered the group password (or the admin).
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $group = $request->route('group');

        abort_unless($group instanceof Group, 404);

        if (! GroupAccess::has($request, $group)) {
            return redirect()->route('groups.show', $group);
        }

        return $next($request);
    }
}
