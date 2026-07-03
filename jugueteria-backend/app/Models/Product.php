<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Product extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;
    protected $fillable = [
        'name',                  // Nombre del juguete
        'slug',                  // URL amigable
        'description',           // Descripción larga
        'short_description',     // Descripción corta (para tarjetas)
        'price',                 // Precio normal
        'offer_price',           // Precio en oferta (nullable)
        'stock',                 // Cantidad en inventario
        'sku',                   // Código único del producto
        'age_from',              // Edad recomendada desde
        'age_to',                // Edad recomendada hasta
        'material',              // Material (plástico, madera, etc.)
        'safety_info',           // Información de seguridad
        'is_featured',           // ¿Destacado en la página principal?
        'is_active',             // ¿Está disponible?
        'category_id',           // Relación con categoría
        'brand_id',              // Relación con marca
    ];

    //Relaciones
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    // Generar slug automáticamente
    protected static function booted()
    {
        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    // Configurar colecciones de medios
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('product-images')
            ->useFallbackUrl('/images/placeholder.png')
            ->useFallbackPath(public_path('/images/placeholder.png'));
    }
}
