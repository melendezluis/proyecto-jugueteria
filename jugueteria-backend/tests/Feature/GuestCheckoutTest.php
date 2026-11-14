<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Notifications\OrderStatusNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GuestCheckoutTest extends TestCase
{
    use RefreshDatabase;

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

    private function placeGuestOrder(Product $product, array $extra = [])
    {
        return $this->postJson('/api/orders', array_merge([
            'guest_email' => 'Invitado@Example.com',
            'delivery_method' => 'pickup',
            'shipping_fullname' => 'Cliente Invitado',
            'shipping_phone' => '987654321',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ], $extra));
    }

    public function test_guest_can_place_an_order_and_receives_an_access_token(): void
    {
        Notification::fake();

        $product = $this->makeProduct();

        $response = $this->placeGuestOrder($product)
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.guest_email', 'invitado@example.com');

        $token = $response->json('guest_token');
        $orderId = $response->json('data.id');

        $this->assertIsString($token);
        $this->assertSame(64, strlen($token));
        $this->assertArrayNotHasKey('guest_token', $response->json('data'));

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'user_id' => null,
            'guest_email' => 'invitado@example.com',
            'guest_token_hash' => hash('sha256', $token),
            'total' => 200,
        ]);

        $this->assertSame(3, $product->fresh()->stock);

        Notification::assertSentOnDemand(
            OrderStatusNotification::class,
            fn (OrderStatusNotification $notification, array $channels, object $notifiable) => $notification->type === 'order-created'
                && ($notifiable->routes['mail'] ?? null) === 'invitado@example.com'
        );
    }

    public function test_guest_order_requires_an_email(): void
    {
        $product = $this->makeProduct();

        $this->postJson('/api/orders', [
            'delivery_method' => 'pickup',
            'shipping_fullname' => 'Cliente Invitado',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertStatus(422)->assertJsonValidationErrors('guest_email');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_guest_can_view_order_with_token_but_not_without_it(): void
    {
        Notification::fake();

        $product = $this->makeProduct();
        $response = $this->placeGuestOrder($product)->assertCreated();
        $token = $response->json('guest_token');
        $orderId = $response->json('data.id');

        $this->getJson("/api/orders/{$orderId}")->assertNotFound();
        $this->getJson("/api/orders/{$orderId}", ['X-Order-Token' => 'token-invalido'])->assertNotFound();

        $this->getJson("/api/orders/{$orderId}", ['X-Order-Token' => $token])
            ->assertOk()
            ->assertJsonPath('data.id', $orderId)
            ->assertJsonPath('data.guest_email', 'invitado@example.com');

        $this->getJson("/api/orders/{$orderId}?token=".urlencode($token))
            ->assertOk()
            ->assertJsonPath('data.id', $orderId);
    }

    public function test_authenticated_user_cannot_view_another_guests_order(): void
    {
        Notification::fake();

        $product = $this->makeProduct();
        $response = $this->placeGuestOrder($product)->assertCreated();
        $orderId = $response->json('data.id');

        Sanctum::actingAs(User::factory()->create());

        $this->getJson("/api/orders/{$orderId}")->assertNotFound();
    }

    public function test_guest_can_cancel_order_with_token_and_stock_is_released(): void
    {
        Notification::fake();

        $product = $this->makeProduct(stock: 5);
        $response = $this->placeGuestOrder($product)->assertCreated();
        $token = $response->json('guest_token');
        $orderId = $response->json('data.id');

        $this->postJson("/api/orders/{$orderId}/cancel", [], ['X-Order-Token' => $token])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertSame(5, $product->fresh()->stock);

        Notification::assertSentOnDemand(
            OrderStatusNotification::class,
            fn (OrderStatusNotification $notification) => $notification->type === 'order-cancelled'
        );
    }

    public function test_guest_can_use_payment_endpoints_with_token(): void
    {
        Notification::fake();

        $product = $this->makeProduct();
        $response = $this->placeGuestOrder($product)->assertCreated();
        $token = $response->json('guest_token');
        $orderId = $response->json('data.id');

        config(['mercadopago.access_token' => null]);

        $this->postJson("/api/orders/{$orderId}/checkout")->assertNotFound();
        $this->postJson("/api/orders/{$orderId}/checkout", [], ['X-Order-Token' => $token])
            ->assertStatus(503);

        $this->getJson("/api/orders/{$orderId}/payment-status", ['X-Order-Token' => $token])
            ->assertOk()
            ->assertJsonPath('data.id', $orderId);
    }

    public function test_guest_coupon_redemption_is_recorded_without_a_user(): void
    {
        Notification::fake();

        $product = $this->makeProduct(price: 100);
        $coupon = Coupon::create([
            'code' => 'INVITADO10',
            'type' => Coupon::TYPE_PERCENTAGE,
            'value' => 10,
            'min_subtotal' => 0,
            'is_active' => true,
        ]);

        $response = $this->placeGuestOrder($product, [
            'coupon_code' => $coupon->code,
        ])->assertCreated();

        $this->assertSame(20.0, (float) $response->json('data.discount'));
        $this->assertSame(180.0, (float) $response->json('data.total'));

        $this->assertDatabaseHas('coupon_redemptions', [
            'coupon_id' => $coupon->id,
            'user_id' => null,
            'guest_email' => 'invitado@example.com',
            'discount' => 20,
        ]);
    }

    public function test_guest_can_lookup_order_after_payment(): void
    {
        Notification::fake();

        $product = $this->makeProduct();
        $response = $this->placeGuestOrder($product)->assertCreated();
        $token = $response->json('guest_token');
        $orderId = $response->json('data.id');

        $order = Order::findOrFail($orderId);
        $order->update(['status' => 'paid']);

        $this->getJson("/api/orders/{$orderId}", ['X-Order-Token' => $token])
            ->assertOk()
            ->assertJsonPath('data.status', 'paid');
    }
}
