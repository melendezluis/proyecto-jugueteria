<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductCatalogFiltersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->defaultCategory = Category::create(['name' => 'Juguetes']);
        $this->defaultBrand = Brand::create(['name' => 'Genérica']);
    }

    private function makeCategory(string $name): Category
    {
        return Category::create(['name' => $name]);
    }

    private function makeBrand(string $name): Brand
    {
        return Brand::create(['name' => $name]);
    }

    private function makeProduct(array $attributes = []): Product
    {
        return Product::create(array_merge([
            'name' => 'Producto Test',
            'price' => 100,
            'stock' => 5,
            'is_active' => true,
            'category_id' => $this->defaultCategory->id,
            'brand_id' => $this->defaultBrand->id,
            'age_from' => 3,
            'age_to' => 7,
        ], $attributes));
    }

    public function test_search_matches_brand_and_category_and_slug(): void
    {
        $this->makeProduct(['name' => 'Bloques Rojos']);

        $brand = $this->makeBrand('LEGO');
        $this->makeProduct(['name' => 'Castillo', 'brand_id' => $brand->id]);

        $category = $this->makeCategory('Muñecas');
        $this->makeProduct(['name' => 'Bebé Llora', 'category_id' => $category->id]);

        $this->makeProduct(['name' => 'Auto Rápido', 'slug' => 'auto-rapido-ultra']);

        $this->getJson('/api/products?search=LEGO')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.brand.name', 'LEGO');

        $this->getJson('/api/products?search=Mu&ntilde;ecas')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.category.name', 'Muñecas');

        $this->getJson('/api/products?search=ultra')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'auto-rapido-ultra');
    }

    public function test_category_slug_filter(): void
    {
        $boards = $this->makeCategory('Juegos de Mesa');
        $dolls = $this->makeCategory('Muñecas');

        $this->makeProduct(['name' => 'Lotería', 'category_id' => $boards->id]);
        $this->makeProduct(['name' => 'Bebé Llora', 'category_id' => $dolls->id]);

        $this->getJson('/api/products?category_slug=juegos-de-mesa')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Lotería');
    }

    public function test_offer_filter_returns_only_products_with_discount(): void
    {
        $this->makeProduct(['name' => 'En Oferta', 'price' => 100, 'offer_price' => 80]);
        $this->makeProduct(['name' => 'Sin Oferta']);

        $this->getJson('/api/products?offer=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'En Oferta');
    }

    public function test_age_range_filter_returns_covering_products(): void
    {
        // Cubre la edad consultada (3-7 vs 4-6)
        $this->makeProduct(['name' => 'Cubre Edad', 'age_from' => 3, 'age_to' => 7]);
        // No cubre: el juguete es solo para mayores
        $this->makeProduct(['name' => 'Solo Grandes', 'age_from' => 9, 'age_to' => 12]);
        // Sin edad definida: no se te excluye del filtro de máximo
        $this->makeProduct(['name' => 'Sin Edad', 'age_from' => null, 'age_to' => null]);

        $response = $this->getJson('/api/products?min_age=4&max_age=6')
            ->assertOk();

        $names = collect($response->json('data'))->pluck('name')->all();
        $this->assertSame(['Cubre Edad'], $names);
    }

    public function test_slugs_filter_returns_only_requested_slugs(): void
    {
        $this->makeProduct(['name' => 'Uno', 'slug' => 'uno']);
        $this->makeProduct(['name' => 'Dos', 'slug' => 'dos']);
        $this->makeProduct(['name' => 'Tres', 'slug' => 'tres']);

        $response = $this->getJson('/api/products?slugs[]=uno&slugs[]=tres')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $slugs = collect($response->json('data'))
            ->pluck('slug')
            ->sort()
            ->values()
            ->all();

        $this->assertSame(['tres', 'uno'], $slugs);
    }

    public function test_per_page_is_capped_at_100(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->makeProduct(['name' => "Producto {$i}"]);
        }

        $this->getJson('/api/products?per_page=100000')
            ->assertOk()
            ->assertJsonPath('pagination.per_page', 100);
    }

    public function test_discount_sort_orders_by_biggest_discount_first(): void
    {
        $this->makeProduct(['name' => 'Grande', 'price' => 200, 'offer_price' => 100]); // 50%
        $this->makeProduct(['name' => 'Medio', 'price' => 100, 'offer_price' => 75]); // 25%
        $this->makeProduct(['name' => 'Sin Oferta']); // 0%

        $response = $this->getJson('/api/products?sort_by=discount&sort_order=desc')
            ->assertOk();

        $this->assertSame(
            ['Grande', 'Medio', 'Sin Oferta'],
            collect($response->json('data'))->pluck('name')->all()
        );
    }

    public function test_price_sort_uses_effective_price(): void
    {
        $this->makeProduct(['name' => 'De 60 con oferta', 'price' => 100, 'offer_price' => 60]);
        $this->makeProduct(['name' => 'De 80', 'price' => 80]);
        $this->makeProduct(['name' => 'De 90 con oferta', 'price' => 100, 'offer_price' => 90]);

        $response = $this->getJson('/api/products?sort_by=price&sort_order=asc')
            ->assertOk();

        $this->assertSame(
            ['De 60 con oferta', 'De 80', 'De 90 con oferta'],
            collect($response->json('data'))->pluck('name')->all()
        );
    }

    public function test_featured_filter(): void
    {
        $this->makeProduct(['name' => 'Destacado', 'is_featured' => true]);
        $this->makeProduct(['name' => 'Normal', 'is_featured' => false]);

        $this->getJson('/api/products?featured=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Destacado');
    }
}
