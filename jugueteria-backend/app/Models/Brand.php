<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',           // Nombre de la marca (ej: LEGO, Mattel, Fisher-Price)
        'slug',           // URL amigable
        'description',    // Descripción de la marca
        'logo',           // Logo de la marca
        'website',        // Página web de la marca (opcional)
        'is_active',      // Si la marca está activa
    ];

    // Relación: Una marca puede tener muchos productos
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // Generar slug automáticamente
    protected static function booted()
    {
        static::creating(function ($brand) {
            if (empty($brand->slug)) {
                $brand->slug = Str::slug($brand->name);
            }
        });
    }
}
