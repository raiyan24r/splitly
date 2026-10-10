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
 * @property int $from_member_id
 * @property int $to_member_id
 * @property int|null $paid_by_member_id Someone who paid on from_member_id's behalf
 * @property bool $owes_payer_back Whether from_member_id now owes paid_by_member_id
 * @property int $amount
 * @property CarbonImmutable $paid_at
 * @property string|null $note
 * @property int|null $created_by_member_id
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $deleted_at
 */
#[Fillable(['from_member_id', 'to_member_id', 'paid_by_member_id', 'owes_payer_back', 'amount', 'paid_at', 'note', 'created_by_member_id'])]
class Payment extends Model
{
    use SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'paid_at' => 'datetime',
            'owes_payer_back' => 'boolean',
        ];
    }

    /**
     * How the payment moves each member's net balance. It always settles
     * from's debt to to; if the payer is to be paid back, that debt moves
     * onto from instead of disappearing.
     *
     * @return array<int, int> member id => change (positive = is owed more)
     */
    public function netEffect(): array
    {
        $effect = [$this->from_member_id => $this->amount, $this->to_member_id => -$this->amount];

        if ($this->paid_by_member_id !== null && $this->owes_payer_back) {
            $effect[$this->from_member_id] -= $this->amount;
            $effect[$this->paid_by_member_id] = $this->amount;
        }

        return $effect;
    }

    /**
     * @return BelongsTo<Group, $this>
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function auditSnapshot(): array
    {
        return [
            'from_member_id' => $this->from_member_id,
            'to_member_id' => $this->to_member_id,
            'paid_by_member_id' => $this->paid_by_member_id,
            'owes_payer_back' => $this->owes_payer_back,
            'amount' => $this->amount,
            'paid_at' => $this->paid_at->format('Y-m-d H:i'),
            'note' => $this->note,
        ];
    }
}
