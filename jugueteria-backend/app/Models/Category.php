<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
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

        static::deleted(function ($category) {
            $category->deleteImageFile();
        });

        static::updated(function ($category) {
            if ($category->wasChanged('image')) {
                $category->deleteImageFile($category->getOriginal('image'));
            }
        });
    }

    public function deleteImageFile(?string $path = null): void
    {
        $path = $path ?? $this->image;

        if (blank($path) || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return;
        }

        $relative = str_starts_with($path, '/storage/')
            ? substr($path, strlen('/storage/'))
            : ltrim($path, '/');

        if ($relative === '' || str_contains($relative, '..')) {
            return;
        }

        Storage::disk('public')->delete($relative);
    }
}
