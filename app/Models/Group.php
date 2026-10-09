<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $slug
 * @property string $name
 * @property string|null $description
 * @property string $currency
 * @property string $password
 * @property bool $simplify_debts
 * @property int|null $created_by
 * @property CarbonImmutable|null $archived_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read int|null $members_count
 * @property-read int|null $expenses_count
 * @property-read int|string|null $expenses_sum_amount
 * @property-read string|null $audit_logs_max_created_at
 */
#[Fillable(['name', 'description', 'currency', 'password', 'simplify_debts', 'created_by'])]
#[Hidden(['password'])]
class Group extends Model
{
    use SoftDeletes;

    public const SLUG_LENGTH = 16;

    protected static function booted(): void
    {
        static::creating(function (Group $group) {
            $group->slug ??= static::generateUniqueSlug();
        });
    }

    /**
     * Generate a random, unguessable slug that is not yet in use.
     */
    public static function generateUniqueSlug(): string
    {
        do {
            $slug = Str::random(self::SLUG_LENGTH);
        } while (static::withTrashed()->where('slug', $slug)->exists());

        return $slug;
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'simplify_debts' => 'boolean',
            'archived_at' => 'datetime',
        ];
    }

    public function isArchived(): bool
    {
        return $this->archived_at !== null;
    }

    /**
     * A fingerprint of the current password, used to invalidate
     * "remember this device" cookies when the password changes.
     */
    public function accessFingerprint(): string
    {
        return hash_hmac('sha256', $this->id.'|'.$this->password, (string) config('app.key'));
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<Member, $this>
     */
    public function members(): HasMany
    {
        return $this->hasMany(Member::class)->orderBy('id');
    }

    /**
     * @return HasMany<Expense, $this>
     */
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    /**
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * @return HasMany<AuditLog, $this>
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }
}
