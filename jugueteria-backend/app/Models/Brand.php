<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
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

        static::deleted(function ($brand) {
            $brand->deleteLogoFile();
        });

        static::updated(function ($brand) {
            if ($brand->wasChanged('logo')) {
                $brand->deleteLogoFile($brand->getOriginal('logo'));
            }
        });
    }

    public function deleteLogoFile(?string $path = null): void
    {
        $path = $path ?? $this->logo;

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
