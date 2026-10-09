<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Group;
use App\Support\Device;
use App\Support\DeviceTrail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'group' => ['nullable', 'string'],
            'action' => ['nullable', 'string', 'max:64'],
            'q' => ['nullable', 'string', 'max:100'],
            'device' => ['nullable', 'string', 'max:64'],
        ]);

        $logs = AuditLog::query()
            ->with('group:id,name,slug')
            ->when($filters['group'] ?? null, fn ($q, $slug) => $q->whereHas('group', fn ($g) => $g->withTrashed()->where('slug', $slug)))
            ->when($filters['action'] ?? null, fn ($q, $action) => $q->where('action', 'like', $action.'%'))
            ->when($filters['device'] ?? null, fn ($q, $device) => $q->where('device_id', $device))
            ->when($filters['q'] ?? null, fn ($q, $term) => $q->where(fn ($w) => $w
                ->where('description', 'like', "%{$term}%")
                ->orWhere('actor_name', 'like', "%{$term}%")
                ->orWhere('ip', 'like', "%{$term}%")))
            ->latest('id')
            ->paginate(50)
            ->withQueryString();

        $trails = DeviceTrail::for($logs->getCollection());

        $logs->through(fn (AuditLog $log) => [
            'id' => $log->id,
            'group' => $log->group ? ['name' => $log->group->name, 'slug' => $log->group->slug] : null,
            'actor_type' => $log->actor_type,
            'actor_name' => $log->actor_name,
            'action' => $log->action,
            'description' => $log->description,
            'changes' => $log->changes,
            'ip' => $log->ip,
            'user_agent' => $log->user_agent,
            'device' => Device::label($log->user_agent),
            'device_id' => $log->device_id,
            'device_tag' => Device::tag($log->device_id),
            'device_trail' => $trails[$log->id] ?? [],
            'created_at' => $log->created_at->toIso8601String(),
        ]);

        return Inertia::render('admin/audit-logs', [
            'logs' => $logs,
            'filters' => $filters,
            'groups' => Group::withTrashed()->orderBy('name')->get(['name', 'slug']),
            'actions' => ['group', 'member', 'identity', 'expense', 'payment', 'comment'],
        ]);
    }
}
