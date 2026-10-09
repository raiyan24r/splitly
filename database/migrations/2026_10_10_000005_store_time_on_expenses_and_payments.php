<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Expenses and payments record the time, not just the day.
     * Existing rows keep their day at 00:00.
     */
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dateTime('spent_at')->change();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dateTime('paid_at')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->date('spent_at')->change();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->date('paid_at')->change();
        });
    }
};
