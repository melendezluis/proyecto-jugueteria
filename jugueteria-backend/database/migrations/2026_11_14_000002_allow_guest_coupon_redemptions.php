<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupon_redemptions', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->string('guest_email')->nullable()->after('user_id');
            $table->index(['coupon_id', 'guest_email', 'released_at']);
        });
    }

    public function down(): void
    {
        Schema::table('coupon_redemptions', function (Blueprint $table) {
            $table->dropIndex(['coupon_id', 'guest_email', 'released_at']);
            $table->dropColumn('guest_email');
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
