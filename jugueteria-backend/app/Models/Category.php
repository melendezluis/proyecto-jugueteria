<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    // 1. Campos que se pueden llenar desde formularios o código
    protected $fillable = [
        'name',           // Nombre de la categoría (ej: "Muñecas")
        'slug',           // URL amigable (ej: "muñecas")
        'description',    // Descripción de la categoría
        'image',          // Ruta de la imagen representativa
        'position',       // Orden en que se muestran las categorías
        'is_active',      // Si la categoría está activa o no
    ];

    // 2. Relación: Una categoría puede tener muchos productos
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // 3. Generar automáticamente el slug cuando se crea una categoría
    protected static function booted()
    {
        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }
}
