<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class JugueteriaSeeder extends Seeder
{
    public function run(): void
    {
        // ==================== CATEGORÍAS ====================
        $categories = [
            'Muñecas y Bebés', 'Juegos de Mesa', 'Figuras de Acción',
            'Didácticos y Educativos', 'Vehículos y Carros',
            'Juguetes al Aire Libre', 'Electrónicos'
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'is_active' => true]
            );
        }

        // ==================== MARCAS ====================
        $brands = ['LEGO', 'Mattel', 'Fisher-Price', 'Hasbro', 'Disney', 'Nerf', 'Hot Wheels'];

        foreach ($brands as $name) {
            Brand::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'is_active' => true]
            );
        }

        // ==================== PRODUCTOS DE EJEMPLO ====================
        $products = [
            [
                'name' => 'LEGO Star Wars Millennium Falcon',
                'price' => 89.99,
                'stock' => 10,
                'age_from' => 8,
                'age_to' => 99,
                'material' => 'Plástico',
                'description' => 'El icónico Halcón Milenario de Star Wars.',
                'category' => 'Figuras de Acción',
                'brand' => 'LEGO',
                'emoji' => '🚀',
                'gradient' => ['#334155', '#0ea5e9'],
                'images' => 2,
                'variants' => [
                    ['sku' => 'LEGO-SW-XL', 'color' => 'Negro', 'size' => 'XL', 'stock' => 3, 'price_extra' => 15.00],
                    ['sku' => 'LEGO-SW-M', 'color' => 'Rojo', 'size' => 'M', 'stock' => 5, 'price_extra' => 5.00],
                ],
            ],
            [
                'name' => 'Barbie Dreamhouse',
                'price' => 449.99,
                'stock' => 6,
                'age_from' => 3,
                'age_to' => 12,
                'material' => 'Plástico y tela',
                'description' => 'La casa de ensueño de Barbie con accesorios.',
                'category' => 'Muñecas y Bebés',
                'brand' => 'Mattel',
                'emoji' => '🏠',
                'gradient' => ['#db2777', '#f9a8d4'],
                'images' => 2,
                'variants' => [],
            ],
            [
                'name' => 'Hot Wheels Pista Turbo',
                'price' => 129.99,
                'stock' => 35,
                'age_from' => 5,
                'age_to' => 12,
                'material' => 'Metal y plástico',
                'description' => 'Pista de carreras con lanzadores.',
                'category' => 'Vehículos y Carros',
                'brand' => 'Hot Wheels',
                'emoji' => '🏎️',
                'gradient' => ['#dc2626', '#fbbf24'],
                'images' => 2,
                'variants' => [
                    ['sku' => 'HW-TURBO-ROJO', 'color' => 'Rojo', 'size' => null, 'stock' => 12, 'price_extra' => 0],
                    ['sku' => 'HW-TURBO-AZUL', 'color' => 'Azul', 'size' => null, 'stock' => 10, 'price_extra' => 0],
                ],
            ],
            [
                'name' => 'Nerf Elite Blaster',
                'price' => 89.99,
                'stock' => 25,
                'age_from' => 6,
                'age_to' => 14,
                'material' => 'Plástico y espuma',
                'description' => 'Pistola Nerf de alta potencia.',
                'category' => 'Juguetes al Aire Libre',
                'brand' => 'Nerf',
                'emoji' => '🔫',
                'gradient' => ['#16a34a', '#facc15'],
                'images' => 2,
                'variants' => [
                    ['sku' => 'NERF-AZUL', 'color' => 'Azul', 'size' => null, 'stock' => 10, 'price_extra' => 0],
                    ['sku' => 'NERF-NARANJA', 'color' => 'Naranja', 'size' => null, 'stock' => 8, 'price_extra' => 5.00],
                ],
            ],
        ];

        foreach ($products as $data) {
            $category = Category::where('slug', Str::slug($data['category']))->first();
            $brand = Brand::where('slug', Str::slug($data['brand']))->first();

            $product = Product::firstOrCreate(
                ['slug' => Str::slug($data['name'])],
                array_merge($data, [
                    'slug' => Str::slug($data['name']),
                    'is_active' => true,
                    'is_featured' => true,
                    'category_id' => $category->id,
                    'brand_id' => $brand->id,
                ])
            );

            $this->seedImages($product, $data);
            $this->seedVariants($product, $data['variants'] ?? []);
        }

        echo "✅ ¡Datos de prueba creados exitosamente!\n";
    }

    /**
     * Genera imágenes SVG de ejemplo y las asocia al producto.
     */
    private function seedImages(Product $product, array $data): void
    {
        if ($product->images()->count() > 0) {
            return;
        }

        $directory = storage_path('app/public/products');
        File::ensureDirectoryExists($directory);

        $count = $data['images'] ?? 1;
        $emoji = $data['emoji'] ?? '🧸';
        $gradient = $data['gradient'] ?? ['#f97316', '#fbbf24'];

        for ($i = 1; $i <= $count; $i++) {
            $filename = Str::slug($product->name) . "-{$i}.svg";
            $svg = $this->makeSvg($product->name, $emoji, $gradient, $i);
            File::put($directory . '/' . $filename, $svg);

            ProductImage::firstOrCreate(
                ['product_id' => $product->id, 'position' => $i - 1],
                [
                    'image_path' => '/storage/products/' . $filename,
                    'alt_text' => $product->name . ($count > 1 ? " - vista {$i}" : ''),
                    'position' => $i - 1,
                    'is_main' => $i === 1,
                ]
            );
        }
    }

    /**
     * Crea las variantes del producto (idempotente por SKU).
     */
    private function seedVariants(Product $product, array $variants): void
    {
        foreach ($variants as $variant) {
            ProductVariant::firstOrCreate(
                ['product_id' => $product->id, 'sku' => $variant['sku']],
                [
                    'color' => $variant['color'] ?? null,
                    'size' => $variant['size'] ?? null,
                    'stock' => $variant['stock'] ?? 0,
                    'price_extra' => $variant['price_extra'] ?? 0,
                    'is_active' => true,
                ]
            );
        }
    }

    /**
     * Construye un SVG placeholder con gradiente, emoji y nombre del producto.
     */
    private function makeSvg(string $title, string $emoji, array $gradient, int $index): string
    {
        [$from, $to] = $gradient;
        $safeTitle = htmlspecialchars($title, ENT_XML1 | ENT_QUOTES, 'UTF-8');
        $altGradient = $index % 2 === 0;

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{$from}"/>
      <stop offset="100%" stop-color="{$to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.4" r="0.6">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <rect width="800" height="800" fill="url(#glow)"/>
  <circle cx="120" cy="150" r="26" fill="#ffffff" fill-opacity="0.15"/>
  <circle cx="680" cy="110" r="40" fill="#ffffff" fill-opacity="0.12"/>
  <circle cx="660" cy="680" r="60" fill="#ffffff" fill-opacity="0.10"/>
  <circle cx="140" cy="640" r="34" fill="#ffffff" fill-opacity="0.14"/>
  <text x="400" y="390" font-size="240" text-anchor="middle" dominant-baseline="central">{$emoji}</text>
  <text x="400" y="660" font-size="52" font-family="Arial, Helvetica, sans-serif" font-weight="bold" text-anchor="middle" fill="#ffffff">{$safeTitle}</text>
  <text x="400" y="730" font-size="26" font-family="Arial, Helvetica, sans-serif" text-anchor="middle" fill="#ffffff" fill-opacity="0.7">El Gato - Juguetería</text>
</svg>
SVG;
    }
}
