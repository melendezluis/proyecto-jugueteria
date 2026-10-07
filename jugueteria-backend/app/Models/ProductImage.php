<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',        // ID del producto al que pertenece la imagen
        'image_path',        // Ruta de la imagen (ej: products/1/foto1.jpg)
        'alt_text',          // Texto alternativo para accesibilidad y SEO
        'position',          // Orden de las imágenes (1 = principal, 2, 3...)
        'is_main',           // ¿Es la imagen principal del producto?
    ];

    protected $casts = [
        'is_main' => 'boolean',
    ];

    // Relación: Una imagen pertenece a un producto
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    protected static function booted(): void
    {
        static::deleting(function (ProductImage $image): void {
            $image->deleteFile();
        });

        static::updated(function (ProductImage $image): void {
            if ($image->wasChanged('image_path')) {
                $image->deleteFile($image->getOriginal('image_path'));
            }
        });
    }

    public function deleteFile(?string $path = null): void
    {
        $path ??= $this->image_path;

        if (! is_string($path) || $path === '') {
            return;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return;
        }

        $relative = str_replace('\\', '/', $path);

        $relative = str_starts_with($relative, '/storage/')
            ? substr($relative, strlen('/storage/'))
            : ltrim($relative, '/');

        if ($relative === '' || str_contains($relative, '..')) {
            return;
        }

        if (OrderItem::where('product_image', $path)->exists()) {
            return;
        }

        Storage::disk('public')->delete($relative);
    }
}
