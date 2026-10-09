<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            // Random id each browser keeps in localStorage, so actions can be traced per device.
            $table->string('device_id', 64)->nullable()->after('user_agent');

            $table->index(['group_id', 'device_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex(['group_id', 'device_id']);
            $table->dropColumn('device_id');
        });
    }
};
