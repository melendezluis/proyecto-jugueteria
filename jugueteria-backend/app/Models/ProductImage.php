<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    // Relación: Una imagen pertenece a un producto
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
