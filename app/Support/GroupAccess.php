<?php

namespace App\Support;

use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

/**
 * Tracks which groups this browser has unlocked with the group password.
 * Access lives in the session, plus a long-lived "remember this device"
 * cookie that stops working as soon as the group password changes.
 */
class GroupAccess
{
    private const SESSION_KEY = 'unlocked_groups';

    private const COOKIE_MINUTES = 60 * 24 * 365;

    public static function has(Request $request, Group $group): bool
    {
        if ($request->user() !== null) {
            return true;
        }

        if (in_array($group->id, $request->session()->get(self::SESSION_KEY, []), true)) {
            return true;
        }

        $cookie = $request->cookie(self::cookieName($group));

        if (is_string($cookie) && hash_equals($group->accessFingerprint(), $cookie)) {
            $request->session()->push(self::SESSION_KEY, $group->id);

            return true;
        }

        return false;
    }

    public static function grant(Request $request, Group $group): void
    {
        $request->session()->regenerate();
        $request->session()->push(self::SESSION_KEY, $group->id);

        Cookie::queue(self::cookieName($group), $group->accessFingerprint(), self::COOKIE_MINUTES);
    }

    public static function revoke(Request $request, Group $group): void
    {
        $request->session()->put(
            self::SESSION_KEY,
            array_values(array_diff($request->session()->get(self::SESSION_KEY, []), [$group->id])),
        );

        Cookie::queue(Cookie::forget(self::cookieName($group)));
    }

    private static function cookieName(Group $group): string
    {
        return 'group_access_'.$group->id;
    }
}
