<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $expense_id
 * @property int|null $member_id
 * @property string $author_name
 * @property string $body
 * @property CarbonImmutable|null $created_at
 */
#[Fillable(['member_id', 'author_name', 'body'])]
class ExpenseComment extends Model
{
    /**
     * @return BelongsTo<Expense, $this>
     */
    public function expense(): BelongsTo
    {
        return $this->belongsTo(Expense::class);
    }
}
