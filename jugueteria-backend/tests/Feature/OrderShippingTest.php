<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderShippingTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(): User
    {
        return User::factory()->create();
    }

    private function makeProduct(int $stock = 5, float $price = 100): Product
    {
        $category = Category::create(['name' => 'Juguetes']);
        $brand = Brand::create(['name' => 'Genérica']);

        return Product::create([
            'name' => 'Peluche Gato',
            'price' => $price,
            'stock' => $stock,
            'is_active' => true,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
        ]);
    }

    private function placeOrder(User $user, array $items, array $extra = []): TestResponse
    {
        Sanctum::actingAs($user);

        return $this->postJson('/api/orders', array_merge([
            'shipping_fullname' => 'Cliente Prueba',
            'shipping_address' => 'Av. Prueba 123',
            'shipping_city' => 'Lima',
            'items' => $items,
        ], $extra));
    }

    public function test_shipping_is_calculated_on_server_ignoring_client_value(): void
    {
        $user = $this->makeUser();
        $product = $this->makeProduct(price: 100);

        $response = $this->placeOrder($user, [
            ['product_id' => $product->id, 'quantity' => 2],
        ], ['shipping' => 0]);

        $response->assertCreated()->assertJsonPath('success', true);

        $this->assertSame(10.0, (float) $response->json('data.shipping'));
        $this->assertSame(210.0, (float) $response->json('data.total'));
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'subtotal' => 200,
            'shipping' => 10,
            'total' => 210,
        ]);
    }

    public function test_shipping_is_applied_even_without_client_shipping_field(): void
    {
        $user = $this->makeUser();
        $product = $this->makeProduct(price: 100);

        $response = $this->placeOrder($user, [
            ['product_id' => $product->id, 'quantity' => 1],
        ])->assertCreated()->assertJsonPath('success', true);

        $this->assertSame(10.0, (float) $response->json('data.shipping'));
    }

    public function test_free_shipping_when_subtotal_reaches_threshold(): void
    {
        config(['shipping.free_threshold' => 150]);

        $user = $this->makeUser();
        $product = $this->makeProduct(price: 100);

        $response = $this->placeOrder($user, [
            ['product_id' => $product->id, 'quantity' => 2],
        ])->assertCreated();

        $this->assertSame(0.0, (float) $response->json('data.shipping'));
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'subtotal' => 200,
            'shipping' => 0,
            'total' => 200,
        ]);
    }

    public function test_shipping_config_endpoint_is_public(): void
    {
        $response = $this->getJson('/api/shipping')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSame(10.0, (float) $response->json('data.flat_rate'));
    }
}
