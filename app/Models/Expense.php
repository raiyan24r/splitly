<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;

/**
 * @property int $id
 * @property int $group_id
 * @property string $description
 * @property int $amount
 * @property string $category
 * @property CarbonImmutable $spent_at
 * @property string $split_type
 * @property string|null $notes
 * @property string|null $receipt_path
 * @property int|null $created_by_member_id
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property CarbonImmutable|null $deleted_at
 * @property-read Collection<int, ExpensePayer> $payers
 * @property-read Collection<int, ExpenseSplit> $splits
 */
#[Fillable(['description', 'amount', 'category', 'spent_at', 'split_type', 'notes', 'receipt_path', 'created_by_member_id'])]
class Expense extends Model
{
    use SoftDeletes;

    public const CATEGORIES = [
        'general', 'food', 'groceries', 'drinks', 'transport', 'fuel',
        'travel', 'stay', 'rent', 'utilities', 'shopping', 'entertainment',
        'health', 'gifts', 'other',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'spent_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Group, $this>
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    /**
     * @return BelongsTo<Member, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'created_by_member_id')->withTrashed();
    }

    /**
     * @return HasMany<ExpensePayer, $this>
     */
    public function payers(): HasMany
    {
        return $this->hasMany(ExpensePayer::class);
    }

    /**
     * @return HasMany<ExpenseSplit, $this>
     */
    public function splits(): HasMany
    {
        return $this->hasMany(ExpenseSplit::class);
    }

    /**
     * @return HasMany<ExpenseComment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(ExpenseComment::class)->oldest();
    }

    /**
     * A plain snapshot of the expense used for audit diffs.
     *
     * @return array<string, mixed>
     */
    public function auditSnapshot(): array
    {
        $this->loadMissing('payers', 'splits');

        return [
            'description' => $this->description,
            'amount' => $this->amount,
            'category' => $this->category,
            'spent_at' => $this->spent_at->format('Y-m-d H:i'),
            'split_type' => $this->split_type,
            'notes' => $this->notes,
            'receipt' => $this->receipt_path !== null,
            'payers' => $this->payers->mapWithKeys(fn (ExpensePayer $p) => [$p->member_id => $p->amount])->all(),
            'splits' => $this->splits->mapWithKeys(fn (ExpenseSplit $s) => [$s->member_id => $s->amount])->all(),
        ];
    }
}
