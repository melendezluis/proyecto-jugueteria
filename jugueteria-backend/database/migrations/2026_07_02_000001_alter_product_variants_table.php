<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('sku')->nullable();
            $table->string('color')->nullable();
            $table->string('size')->nullable();
            $table->integer('stock')->default(0);
            $table->decimal('price_extra', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropColumn([
                'product_id', 'sku', 'color', 'size',
                'stock', 'price_extra', 'is_active'
            ]);
        });
    }
};
