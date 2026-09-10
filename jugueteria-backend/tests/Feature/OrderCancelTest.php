<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderCancelTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(): User
    {
        return User::factory()->create();
    }

    private function makeProduct(int $stock = 5): Product
    {
        $category = Category::create(['name' => 'Juguetes']);
        $brand = Brand::create(['name' => 'Genérica']);

        return Product::create([
            'name' => 'Peluche Gato',
            'price' => 100,
            'stock' => $stock,
            'is_active' => true,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
        ]);
    }

    private function makeOrder(User $user, array $attributes = []): Order
    {
        return Order::create(array_merge([
            'user_id' => $user->id,
            'subtotal' => 100,
            'shipping' => 10,
            'total' => 110,
            'status' => 'pending',
            'shipping_fullname' => 'Cliente Prueba',
            'shipping_address' => 'Av. Prueba 123',
            'shipping_city' => 'Lima',
        ], $attributes));
    }

    public function test_cancel_pending_order_restores_product_stock(): void
    {
        Notification::fake();

        $user = $this->makeUser();
        $product = $this->makeProduct(stock: 5);

        $order = $this->makeOrder($user);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => 100,
            'quantity' => 2,
            'total' => 200,
        ]);

        // La creación de la orden reserva (descuenta) el stock
        $product->decrement('stock', 2);
        $this->assertSame(3, $product->fresh()->stock);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/orders/{$order->id}/cancel");

        $response->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'cancelled',
        ]);

        $this->assertNotNull($order->fresh()->cancelled_at);
        $this->assertSame(5, $product->fresh()->stock);
    }

    public function test_cancel_pending_order_restores_variant_stock(): void
    {
        Notification::fake();

        $user = $this->makeUser();
        $product = $this->makeProduct(stock: 5);
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'color' => 'Rojo',
            'size' => 'M',
            'stock' => 3,
            'is_active' => true,
        ]);

        $order = $this->makeOrder($user);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => 100,
            'quantity' => 1,
            'total' => 100,
            'color' => 'Rojo',
            'size' => 'M',
        ]);

        $variant->decrement('stock', 1);
        $this->assertSame(2, $variant->fresh()->stock);

        Sanctum::actingAs($user);

        $this->postJson("/api/orders/{$order->id}/cancel")->assertOk();

        $this->assertSame(3, $variant->fresh()->stock);
    }

    public function test_cannot_cancel_a_paid_order(): void
    {
        Notification::fake();

        $user = $this->makeUser();
        $order = $this->makeOrder($user, ['status' => 'paid']);

        Sanctum::actingAs($user);

        $this->postJson("/api/orders/{$order->id}/cancel")
            ->assertStatus(422);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'paid',
        ]);
    }

    public function test_user_cannot_cancel_another_users_order(): void
    {
        Notification::fake();

        $owner = $this->makeUser();
        $other = $this->makeUser();
        $order = $this->makeOrder($owner);

        Sanctum::actingAs($other);

        $this->postJson("/api/orders/{$order->id}/cancel")
            ->assertNotFound();

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'pending',
        ]);
    }
}
