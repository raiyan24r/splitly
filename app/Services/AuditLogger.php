<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Group;
use App\Support\CurrentMember;
use App\Support\Device;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuditLogger
{
    public function __construct(
        private Request $request,
        private CurrentMember $current,
    ) {}

    /**
     * @param  array<string, mixed>|null  $changes
     */
    public function log(
        ?Group $group,
        string $action,
        string $description,
        ?Model $subject = null,
        ?array $changes = null,
    ): AuditLog {
        $member = $this->current->member;
        $user = $this->request->user();

        return AuditLog::create([
            'group_id' => $group?->id,
            'actor_type' => match (true) {
                $member !== null => 'member',
                $user !== null => 'admin',
                default => 'guest',
            },
            'actor_user_id' => $user?->id,
            'actor_member_id' => $member?->id,
            'actor_name' => $member->name ?? ($user ? $user->name.' (admin)' : 'Someone'),
            'action' => $action,
            'subject_type' => $subject ? Str::snake(class_basename($subject)) : null,
            'subject_id' => $subject?->getKey(),
            'description' => Str::limit($description, 497),
            'changes' => $changes ?: null,
            'ip' => $this->request->ip(),
            'user_agent' => Str::limit((string) $this->request->userAgent(), 497),
            'device_id' => Device::id($this->request),
        ]);
    }

    /**
     * Keep only the keys whose values differ, as ['key' => ['from' => .., 'to' => ..]].
     *
     * @param  array<string, mixed>  $before
     * @param  array<string, mixed>  $after
     * @return array<string, array{from: mixed, to: mixed}>
     */
    public static function diff(array $before, array $after): array
    {
        $changes = [];

        foreach (array_unique([...array_keys($before), ...array_keys($after)]) as $key) {
            $from = $before[$key] ?? null;
            $to = $after[$key] ?? null;

            if ($from != $to) {
                $changes[$key] = ['from' => $from, 'to' => $to];
            }
        }

        return $changes;
    }
}
