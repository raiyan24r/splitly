<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $group_id
 * @property string $name
 * @property string $color
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property CarbonImmutable|null $deleted_at
 */
#[Fillable(['name', 'color'])]
class Member extends Model
{
    use SoftDeletes;

    /**
     * Avatar colours, picked round-robin as members are added.
     */
    public const COLORS = [
        '#34d399', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa',
        '#f87171', '#22d3ee', '#a3e635', '#fb923c', '#e879f9',
    ];

    public static function nextColorFor(Group $group): string
    {
        $count = $group->members()->withTrashed()->count();

        return self::COLORS[$count % count(self::COLORS)];
    }

    /**
     * @return BelongsTo<Group, $this>
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }
}
