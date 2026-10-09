<?php

namespace App\Support;

use App\Models\AuditLog;
use Illuminate\Support\Collection;

/**
 * For audit entries, works out which member names the same device had acted
 * as (within the same group) up to that point, e.g. ["Alice", "Cara"].
 * Consecutive repeats are collapsed, so the list reads as a switch trail.
 */
class DeviceTrail
{
    // Enough for the full trail in practice, while keeping payloads bounded.
    private const MAX_NAMES = 50;

    /**
     * @param  Collection<int, AuditLog>  $logs
     * @return array<int, list<string>> audit log id => names, oldest first
     */
    public static function for(Collection $logs): array
    {
        $wanted = $logs->filter(fn (AuditLog $log) => $log->device_id !== null)->sortBy('id')->values();

        if ($wanted->isEmpty()) {
            return [];
        }

        $history = AuditLog::query()
            ->select(['id', 'group_id', 'device_id', 'actor_name'])
            ->whereIn('device_id', $wanted->pluck('device_id')->unique()->values())
            ->where('actor_type', 'member')
            ->where('id', '<=', $wanted->last()->id)
            ->orderBy('id')
            ->get();

        $trails = [];
        $result = [];
        $next = 0;

        // Walk the device history in id order. Before applying each row, record
        // the trail for every wanted entry that came earlier. The trailing null
        // flushes the rest.
        foreach ([...$history->all(), null] as $row) {
            $upTo = $row->id ?? PHP_INT_MAX;

            while ($next < $wanted->count() && $wanted[$next]->id < $upTo) {
                $log = $wanted[$next];
                $result[$log->id] = $trails[self::key($log)] ?? [];
                $next++;
            }

            if ($row === null) {
                break;
            }

            $key = self::key($row);
            $trail = $trails[$key] ?? [];

            if (end($trail) !== $row->actor_name) {
                $trail[] = $row->actor_name;
            }

            $trails[$key] = array_slice($trail, -self::MAX_NAMES);
        }

        return $result;
    }

    private static function key(AuditLog $log): string
    {
        return $log->group_id.'|'.$log->device_id;
    }
}
