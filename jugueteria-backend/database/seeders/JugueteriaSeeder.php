<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
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
                'price' => 899.99,
                'stock' => 12,
                'age_from' => 8,
                'age_to' => 99,
                'material' => 'Plástico',
                'description' => 'El icónico Halcón Milenario de Star Wars.',
                'category_id' => 3, // Figuras de Acción
                'brand_id' => 1, // LEGO
            ],
            [
                'name' => 'Barbie Dreamhouse',
                'price' => 449.99,
                'stock' => 8,
                'age_from' => 3,
                'age_to' => 12,
                'material' => 'Plástico y tela',
                'description' => 'La casa de ensueño de Barbie con accesorios.',
                'category_id' => 1, // Muñecas y Bebés
                'brand_id' => 2, // Mattel
            ],
            [
                'name' => 'Hot Wheels Pista Turbo',
                'price' => 129.99,
                'stock' => 35,
                'age_from' => 5,
                'age_to' => 12,
                'material' => 'Metal y plástico',
                'description' => 'Pista de carreras con lanzadores.',
                'category_id' => 5, // Vehículos y Carros
                'brand_id' => 7, // Hot Wheels
            ],
            [
                'name' => 'Nerf Elite Blaster',
                'price' => 89.99,
                'stock' => 25,
                'age_from' => 6,
                'age_to' => 14,
                'material' => 'Plástico y espuma',
                'description' => 'Pistola Nerf de alta potencia.',
                'category_id' => 6, // Juguetes al Aire Libre
                'brand_id' => 6, // Nerf
            ],
        ];

        foreach ($products as $data) {
            Product::create(array_merge($data, [
                'slug' => Str::slug($data['name']),
                'is_active' => true,
                'is_featured' => true,
                'category_id' => $data['category_id'],
                'brand_id' => $data['brand_id'],
            ]));
        }

        echo "✅ ¡Datos de prueba creados exitosamente!\n";
    }
}