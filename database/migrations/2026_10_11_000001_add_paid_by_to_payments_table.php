<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A payment can be made by someone else on the debtor's behalf, who may
     * or may not want the money back.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('paid_by_member_id')->nullable()->after('to_member_id')->constrained('members')->nullOnDelete();
            $table->boolean('owes_payer_back')->default(false)->after('paid_by_member_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('paid_by_member_id');
            $table->dropColumn('owes_payer_back');
        });
    }
};
