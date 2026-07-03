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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');                    // Nombre: Muñecas, Carros, Didácticos...
            $table->string('slug')->unique();          // URL amigable (muñecas, juegos-de-mesa)
            $table->text('description')->nullable();
            $table->string('image')->nullable();       // Foto representativa de la categoría
            $table->integer('position')->default(0);   // Para ordenar las categorías
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
