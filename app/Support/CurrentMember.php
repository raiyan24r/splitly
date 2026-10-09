<?php

namespace App\Support;

use App\Models\Member;

/**
 * Request-scoped holder for the group member the browser says it is
 * (sent as the X-Member-Id header from localStorage).
 */
class CurrentMember
{
    public ?Member $member = null;
}
