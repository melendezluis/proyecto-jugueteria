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
            'shipping_address' => 'Av. Prueba',
            'shipping_address_number' => '123',
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

    public function test_pickup_order_has_no_shipping_cost_and_keeps_gift_data(): void
    {
        $user = $this->makeUser();
        $product = $this->makeProduct(price: 100);

        $response = $this->placeOrder($user, [
            ['product_id' => $product->id, 'quantity' => 2],
        ], [
            'delivery_method' => 'pickup',
            'shipping_address' => null,
            'shipping_address_number' => null,
            'shipping_city' => null,
            'gift_wrap' => true,
            'gift_message' => 'Feliz cumpleaños, Sofía.',
        ])->assertCreated()->assertJsonPath('success', true);

        $this->assertSame(0.0, (float) $response->json('data.shipping'));
        $this->assertSame(200.0, (float) $response->json('data.total'));
        $response->assertJsonPath('data.delivery_method', 'pickup');
        $response->assertJsonPath('data.delivery_method_label', 'Recojo en tienda');
        $response->assertJsonPath('data.gift_wrap', true);
        $response->assertJsonPath('data.gift_message', 'Feliz cumpleaños, Sofía.');

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'delivery_method' => 'pickup',
            'gift_wrap' => true,
            'gift_message' => 'Feliz cumpleaños, Sofía.',
            'shipping_address' => null,
            'shipping_address_number' => null,
            'shipping_city' => null,
            'shipping' => 0,
            'total' => 200,
        ]);
    }

    public function test_shipping_order_requires_address_and_address_number(): void
    {
        $user = $this->makeUser();
        $product = $this->makeProduct(price: 100);

        Sanctum::actingAs($user);

        $this->postJson('/api/orders', [
            'delivery_method' => 'shipping',
            'shipping_fullname' => 'Cliente Prueba',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['shipping_address', 'shipping_address_number']);
    }

    public function test_chancay_order_uses_local_shipping_rate(): void
    {
        $user = $this->makeUser();
        $product = $this->makeProduct(price: 100);

        $response = $this->placeOrder($user, [
            ['product_id' => $product->id, 'quantity' => 1],
        ], [
            'shipping_latitude' => -11.5681,
            'shipping_longitude' => -77.2697,
        ])->assertCreated();

        $this->assertSame(5.0, (float) $response->json('data.shipping'));
        $this->assertSame(105.0, (float) $response->json('data.total'));
    }

    public function test_nearby_zone_uses_nearby_shipping_rate(): void
    {
        $user = $this->makeUser();
        $product = $this->makeProduct(price: 100);

        $response = $this->placeOrder($user, [
            ['product_id' => $product->id, 'quantity' => 1],
        ], [
            'shipping_latitude' => -11.4950,
            'shipping_longitude' => -77.2070,
        ])->assertCreated();

        $this->assertSame(10.0, (float) $response->json('data.shipping'));
        $this->assertSame(110.0, (float) $response->json('data.total'));
    }

    public function test_order_outside_coverage_is_rejected(): void
    {
        $user = $this->makeUser();
        $product = $this->makeProduct(price: 100);

        $this->placeOrder($user, [
            ['product_id' => $product->id, 'quantity' => 1],
        ], [
            'shipping_latitude' => -12.0464,
            'shipping_longitude' => -77.0428,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['shipping_address']);

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_pickup_is_allowed_even_outside_coverage(): void
    {
        $user = $this->makeUser();
        $product = $this->makeProduct(price: 100);

        $response = $this->placeOrder($user, [
            ['product_id' => $product->id, 'quantity' => 1],
        ], [
            'delivery_method' => 'pickup',
            'shipping_address' => null,
            'shipping_address_number' => null,
            'shipping_city' => null,
            'shipping_latitude' => -12.0464,
            'shipping_longitude' => -77.0428,
        ])->assertCreated();

        $this->assertSame(0.0, (float) $response->json('data.shipping'));
    }

    public function test_shipping_config_endpoint_is_public(): void
    {
        $response = $this->getJson('/api/shipping')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSame(10.0, (float) $response->json('data.flat_rate'));
        $this->assertSame(5.0, (float) $response->json('data.local_rate'));
        $this->assertSame(10.0, (float) $response->json('data.nearby_rate'));
        $this->assertSame(15.0, (float) $response->json('data.max_radius_km'));
    }
}
