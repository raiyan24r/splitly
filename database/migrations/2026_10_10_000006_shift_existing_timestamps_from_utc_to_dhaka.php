<?php

use Carbon\CarbonImmutable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The app used to run on UTC and now runs on Asia/Dhaka (GMT+6). Timestamps
 * are stored as wall-clock values in the app timezone, so rows written
 * before the switch are moved forward 6 hours to keep showing the right time.
 * On a fresh database the tables are empty and this does nothing.
 */
return new class extends Migration
{
    /**
     * @var array<string, list<string>>
     */
    private array $columns = [
        'users' => ['email_verified_at', 'created_at', 'updated_at'],
        'groups' => ['archived_at', 'created_at', 'updated_at', 'deleted_at'],
        'members' => ['created_at', 'updated_at', 'deleted_at'],
        'expenses' => ['created_at', 'updated_at', 'deleted_at'],
        'expense_comments' => ['created_at', 'updated_at'],
        'payments' => ['created_at', 'updated_at', 'deleted_at'],
        'audit_logs' => ['created_at'],
    ];

    public function up(): void
    {
        $this->shift(6);
    }

    public function down(): void
    {
        $this->shift(-6);
    }

    private function shift(int $hours): void
    {
        foreach ($this->columns as $table => $columns) {
            DB::table($table)
                ->select(['id', ...$columns])
                ->chunkById(500, function ($rows) use ($table, $columns, $hours) {
                    foreach ($rows as $row) {
                        $changes = [];

                        foreach ($columns as $column) {
                            $value = $row->{$column};

                            if (is_string($value)) {
                                $changes[$column] = CarbonImmutable::parse($value)
                                    ->addHours($hours)
                                    ->format('Y-m-d H:i:s');
                            }
                        }

                        if ($changes !== []) {
                            DB::table($table)->where('id', $row->id)->update($changes);
                        }
                    }
                });
        }
    }
};
