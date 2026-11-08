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
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('delivery_method', ['shipping', 'pickup'])->default('shipping')->after('status');
            $table->boolean('gift_wrap')->default(false)->after('delivery_method');
            $table->text('gift_message')->nullable()->after('gift_wrap');
            $table->decimal('shipping_latitude', 10, 7)->nullable()->after('shipping_city');
            $table->decimal('shipping_longitude', 10, 7)->nullable()->after('shipping_latitude');
            $table->string('shipping_address')->nullable()->change();
            $table->string('shipping_city')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_method',
                'gift_wrap',
                'gift_message',
                'shipping_latitude',
                'shipping_longitude',
            ]);
            $table->string('shipping_address')->nullable(false)->change();
            $table->string('shipping_city')->nullable(false)->change();
        });
    }
};
