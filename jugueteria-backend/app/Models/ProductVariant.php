<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',        // ID del producto al que pertenece
        'sku',               // Código único de la variante
        'color',             // Color (Rojo, Azul, etc.)
        'size',              // Talla o tamaño (Pequeño, Mediano, Grande)
        'stock',             // Cantidad disponible de esta variante
        'price_extra',       // Precio adicional (si es más caro que el base)
        'is_active',         // Si esta variante está disponible
    ];

    // Relación: Una variante pertenece a un producto
    public function product()
    {
        return $this->belongsTo(Product::class);
    } 
}
