<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->string('guest_email')->nullable()->after('user_id');
            $table->text('guest_token')->nullable()->after('guest_email');
            $table->string('guest_token_hash', 64)->nullable()->unique()->after('guest_token');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['guest_token_hash']);
            $table->dropColumn(['guest_email', 'guest_token', 'guest_token_hash']);
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
