<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('full_name');
            $table->string('document_type', 20);
            $table->string('document_number', 30);
            $table->string('email');
            $table->string('phone', 30)->nullable();
            $table->string('address', 500)->nullable();
            $table->string('order_number', 50)->nullable();
            $table->string('type', 20);
            $table->string('product_service', 500);
            $table->decimal('amount', 10, 2)->nullable();
            $table->text('detail');
            $table->text('request');
            $table->string('status', 20)->default('pending');
            $table->text('response')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
