<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Group;
use App\Models\Member;
use App\Services\AuditLogger;
use App\Support\Device;
use App\Support\DeviceTrail;
use App\Support\Money;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    public function index(): Response
    {
        $groups = Group::query()
            ->withCount(['members', 'expenses'])
            ->withSum('expenses', 'amount')
            ->withMax('auditLogs', 'created_at')
            ->orderByRaw('archived_at is not null')
            ->latest()
            ->get()
            ->map(fn (Group $g) => [
                'slug' => $g->slug,
                'name' => $g->name,
                'currency' => $g->currency,
                'exponent' => Money::exponent($g->currency),
                'members_count' => $g->members_count,
                'expenses_count' => $g->expenses_count,
                'total_spent' => (int) $g->expenses_sum_amount,
                'last_activity' => $g->audit_logs_max_created_at !== null
                    ? CarbonImmutable::parse($g->audit_logs_max_created_at)->toIso8601String()
                    : null,
                'archived' => $g->isArchived(),
                'url' => route('groups.show', $g),
                'created_at' => $g->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/groups/index', [
            'groups' => $groups,
            'currencies' => Money::CURRENCIES,
        ]);
    }

    public function store(Request $request, AuditLogger $audit): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'currency' => ['required', Rule::in(Money::CURRENCIES)],
            'password' => ['required', 'string', 'min:4', 'max:255'],
            'members' => ['array', 'max:100'],
            'members.*' => ['required', 'string', 'max:60', 'distinct:ignore_case'],
        ], [
            'members.*.distinct' => 'Each member needs a different name.',
        ]);

        $group = DB::transaction(function () use ($data, $request) {
            $group = Group::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'currency' => $data['currency'],
                'password' => $data['password'],
                'created_by' => $request->user()->id,
            ]);

            foreach ($data['members'] ?? [] as $name) {
                $group->members()->create([
                    'name' => trim($name),
                    'color' => Member::nextColorFor($group),
                ]);
            }

            return $group;
        });

        $memberNames = $group->members()->pluck('name');

        $audit->log($group, 'group.created', "Created the group \"{$group->name}\"".
            ($memberNames->isNotEmpty() ? ' with '.$memberNames->join(', ', ' and ') : ''), $group);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Group created. Share the link and password!']);

        return to_route('admin.groups.show', $group);
    }

    public function show(Group $group): Response
    {
        return Inertia::render('admin/groups/show', [
            'group' => [
                'slug' => $group->slug,
                'name' => $group->name,
                'description' => $group->description,
                'currency' => $group->currency,
                'archived' => $group->isArchived(),
                'url' => route('groups.show', $group),
                'created_at' => $group->created_at?->toIso8601String(),
                'has_transactions' => $group->expenses()->withTrashed()->exists() || $group->payments()->withTrashed()->exists(),
            ],
            'members' => $group->members()->get(['id', 'name', 'color']),
            'logs' => $this->recentLogs($group),
            'currencies' => Money::CURRENCIES,
        ]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function recentLogs(Group $group): array
    {
        $logs = $group->auditLogs()->latest('id')->limit(50)->get();
        $trails = DeviceTrail::for($logs);

        return array_values($logs->map(fn (AuditLog $log) => [
            'id' => $log->id,
            'actor_name' => $log->actor_name,
            'actor_type' => $log->actor_type,
            'action' => $log->action,
            'description' => $log->description,
            'ip' => $log->ip,
            'device' => Device::label($log->user_agent),
            'device_id' => $log->device_id,
            'device_tag' => Device::tag($log->device_id),
            'device_trail' => $trails[$log->id] ?? [],
            'created_at' => $log->created_at->toIso8601String(),
        ])->all());
    }

    public function update(Request $request, Group $group, AuditLogger $audit): RedirectResponse
    {
        $hasTransactions = $group->expenses()->withTrashed()->exists() || $group->payments()->withTrashed()->exists();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'currency' => [
                'required',
                Rule::in(Money::CURRENCIES),
                // Amounts are stored in minor units, so the currency is locked once money is recorded.
                Rule::when($hasTransactions, Rule::in([$group->currency])),
            ],
        ], ['currency.in' => 'The currency can only be changed before any expenses are added.']);

        $before = $group->only(['name', 'description', 'currency']);
        $group->update($data);
        $changes = AuditLogger::diff($before, $group->only(['name', 'description', 'currency']));

        if ($changes !== []) {
            $audit->log($group, 'group.updated', 'Updated group details ('.implode(', ', array_keys($changes)).')', $group, $changes);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Group updated']);

        return back();
    }

    public function password(Request $request, Group $group, AuditLogger $audit): RedirectResponse
    {
        $data = $request->validate(['password' => ['required', 'string', 'min:4', 'max:255']]);

        $group->update(['password' => $data['password']]);

        $audit->log($group, 'group.password_changed', 'Changed the group password (everyone must enter it again)', $group);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Password changed. Existing devices were signed out.']);

        return back();
    }

    public function regenerateSlug(Group $group, AuditLogger $audit): RedirectResponse
    {
        $old = $group->slug;
        $group->slug = Group::generateUniqueSlug();
        $group->save();

        $audit->log($group, 'group.link_changed', 'Changed the group link (the old link stopped working)', $group, [
            'slug' => ['from' => $old, 'to' => $group->slug],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'New link generated. The old one no longer works.']);

        return to_route('admin.groups.show', $group);
    }

    public function archive(Group $group, AuditLogger $audit): RedirectResponse
    {
        $group->archived_at = $group->isArchived() ? null : now();
        $group->save();

        $audit->log(
            $group,
            $group->isArchived() ? 'group.archived' : 'group.unarchived',
            $group->isArchived() ? 'Archived the group (read-only)' : 'Unarchived the group',
            $group,
        );

        return back();
    }

    public function destroy(Group $group, AuditLogger $audit): RedirectResponse
    {
        $group->delete();

        $audit->log($group, 'group.deleted', "Deleted the group \"{$group->name}\"", $group);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Deleted \"{$group->name}\""]);

        return to_route('admin.groups.index');
    }
}
