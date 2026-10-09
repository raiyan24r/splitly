<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

/**
 * Insert-only record of every change made in the app.
 *
 * @property int $id
 * @property int|null $group_id
 * @property string $actor_type
 * @property int|null $actor_user_id
 * @property int|null $actor_member_id
 * @property string $actor_name
 * @property string $action
 * @property string|null $subject_type
 * @property int|null $subject_id
 * @property string $description
 * @property array<string, mixed>|null $changes
 * @property string|null $ip
 * @property string|null $user_agent
 * @property string|null $device_id
 * @property CarbonImmutable $created_at
 */
#[Fillable([
    'group_id', 'actor_type', 'actor_user_id', 'actor_member_id', 'actor_name',
    'action', 'subject_type', 'subject_id', 'description', 'changes', 'ip', 'user_agent', 'device_id',
])]
class AuditLog extends Model
{
    public const UPDATED_AT = null;

    protected static function booted(): void
    {
        static::updating(fn () => throw new LogicException('Audit logs are immutable.'));
        static::deleting(fn () => throw new LogicException('Audit logs are immutable.'));
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'changes' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Group, $this>
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class)->withTrashed();
    }
}
