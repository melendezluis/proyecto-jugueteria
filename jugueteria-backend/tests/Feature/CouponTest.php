<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\CouponRedemption;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CouponTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Notification::fake();
    }

    private function makeUser(): User
    {
        return User::factory()->create();
    }

    private function makeProduct(int $stock = 10, float $price = 100, ?float $offerPrice = null): Product
    {
        $category = Category::create(['name' => 'Juguetes']);
        $brand = Brand::create(['name' => 'Generica']);

        return Product::create([
            'name' => 'Peluche Gato',
            'price' => $price,
            'offer_price' => $offerPrice,
            'stock' => $stock,
            'is_active' => true,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
        ]);
    }

    private function makeCoupon(array $attributes = []): Coupon
    {
        return Coupon::create(array_merge([
            'code' => 'VERANO10',
            'type' => Coupon::TYPE_PERCENTAGE,
            'value' => 10,
            'min_subtotal' => 0,
            'is_active' => true,
        ], $attributes));
    }

    private function placeOrder(User $user, Product $product, int $quantity = 1, array $extra = []): TestResponse
    {
        Sanctum::actingAs($user);

        return $this->postJson('/api/orders', array_merge([
            'delivery_method' => 'pickup',
            'shipping_fullname' => 'Cliente Prueba',
            'items' => [
                ['product_id' => $product->id, 'quantity' => $quantity],
            ],
        ], $extra));
    }

    public function test_percentage_coupon_applies_and_respects_max_discount(): void
    {
        $user = $this->makeUser();
        $product = $this->makeProduct(price: 100);
        $coupon = $this->makeCoupon(['max_discount' => 15]);

        $response = $this->placeOrder($user, $product, 2, [
            'coupon_code' => strtolower($coupon->code),
            'discount' => 999,
            'total' => 1,
        ])->assertCreated();

        $response->assertJsonPath('data.coupon_code', 'VERANO10');
        $this->assertSame(200.0, (float) $response->json('data.subtotal'));
        $this->assertSame(15.0, (float) $response->json('data.discount'));
        $this->assertSame(185.0, (float) $response->json('data.total'));

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'coupon_code' => 'VERANO10',
            'discount' => 15,
            'total' => 185,
        ]);

        $this->assertDatabaseHas('coupon_redemptions', [
            'coupon_id' => $coupon->id,
            'user_id' => $user->id,
            'discount' => 15,
        ]);
    }

    public function test_fixed_coupon_uses_offer_price_as_subtotal(): void
    {
        $user = $this->makeUser();
        $product = $this->makeProduct(price: 100, offerPrice: 80);
        $this->makeCoupon(['type' => Coupon::TYPE_FIXED, 'value' => 25]);

        $response = $this->placeOrder($user, $product, 1, [
            'coupon_code' => 'VERANO10',
        ])->assertCreated();

        $this->assertSame(80.0, (float) $response->json('data.subtotal'));
        $this->assertSame(25.0, (float) $response->json('data.discount'));
        $this->assertSame(55.0, (float) $response->json('data.total'));
    }

    public function test_coupon_rejects_purchase_below_minimum(): void
    {
        $user = $this->makeUser();
        $product = $this->makeProduct(price: 50);
        $this->makeCoupon(['min_subtotal' => 100]);

        $this->placeOrder($user, $product, 1, [
            'coupon_code' => 'VERANO10',
        ])->assertStatus(422)->assertJsonValidationErrors('coupon_code');
    }

    public function test_coupon_must_be_active_and_within_dates(): void
    {
        $user = $this->makeUser();
        $product = $this->makeProduct();

        $this->makeCoupon(['code' => 'INACTIVO', 'is_active' => false]);
        $this->makeCoupon(['code' => 'FUTURO', 'starts_at' => now()->addDay()]);
        $this->makeCoupon(['code' => 'VENCIDO', 'expires_at' => now()->subDay()]);

        foreach (['INACTIVO', 'FUTURO', 'VENCIDO'] as $code) {
            $this->placeOrder($user, $product, 1, [
                'coupon_code' => $code,
            ])->assertStatus(422)->assertJsonValidationErrors('coupon_code');
        }
    }

    public function test_unknown_coupon_returns_spanish_validation_error(): void
    {
        $user = $this->makeUser();
        $product = $this->makeProduct();

        $this->placeOrder($user, $product, 1, [
            'coupon_code' => 'NOEXISTE',
        ])->assertStatus(422)->assertJsonValidationErrors('coupon_code');
    }

    public function test_coupon_usage_limit_is_enforced(): void
    {
        $user = $this->makeUser();
        $otherUser = $this->makeUser();
        $product = $this->makeProduct(stock: 20);
        $this->makeCoupon(['usage_limit' => 1]);

        $this->placeOrder($user, $product, 1, [
            'coupon_code' => 'VERANO10',
        ])->assertCreated();

        $this->placeOrder($otherUser, $product, 1, [
            'coupon_code' => 'VERANO10',
        ])->assertStatus(422)->assertJsonValidationErrors('coupon_code');
    }

    public function test_coupon_per_user_limit_is_enforced(): void
    {
        $user = $this->makeUser();
        $otherUser = $this->makeUser();
        $product = $this->makeProduct(stock: 20);
        $this->makeCoupon(['usage_limit' => 5, 'usage_limit_per_user' => 1]);

        $this->placeOrder($user, $product, 1, [
            'coupon_code' => 'VERANO10',
        ])->assertCreated();

        $this->placeOrder($user, $product, 1, [
            'coupon_code' => 'VERANO10',
        ])->assertStatus(422)->assertJsonValidationErrors('coupon_code');

        $this->placeOrder($otherUser, $product, 1, [
            'coupon_code' => 'VERANO10',
        ])->assertCreated();
    }

    public function test_cancelling_order_releases_coupon_usage(): void
    {
        $user = $this->makeUser();
        $product = $this->makeProduct(stock: 10);
        $coupon = $this->makeCoupon(['usage_limit' => 1]);

        $firstOrder = $this->placeOrder($user, $product, 1, [
            'coupon_code' => 'VERANO10',
        ])->assertCreated();

        $orderId = $firstOrder->json('data.id');

        $this->postJson("/api/orders/{$orderId}/cancel")->assertOk();

        $redemption = CouponRedemption::where('order_id', $orderId)->firstOrFail();
        $this->assertNotNull($redemption->released_at);

        $this->placeOrder($user, $product, 1, [
            'coupon_code' => $coupon->code,
        ])->assertCreated();
    }

    public function test_shipping_threshold_is_calculated_before_discount(): void
    {
        config(['shipping.free_threshold' => 150]);

        $user = $this->makeUser();
        $product = $this->makeProduct(price: 100);
        $this->makeCoupon(['value' => 20]);

        $response = $this->placeOrder($user, $product, 2, [
            'delivery_method' => 'shipping',
            'shipping_address' => 'Av. Prueba',
            'shipping_address_number' => '123',
            'shipping_latitude' => -11.5681,
            'shipping_longitude' => -77.2697,
            'coupon_code' => 'VERANO10',
        ])->assertCreated();

        $this->assertSame(200.0, (float) $response->json('data.subtotal'));
        $this->assertSame(40.0, (float) $response->json('data.discount'));
        $this->assertSame(0.0, (float) $response->json('data.shipping'));
        $this->assertSame(160.0, (float) $response->json('data.total'));
    }

    public function test_coupon_validation_endpoint_returns_quote(): void
    {
        $user = $this->makeUser();
        $product = $this->makeProduct(price: 100);
        $this->makeCoupon(['type' => Coupon::TYPE_FIXED, 'value' => 25, 'min_subtotal' => 100]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/coupons/validate', [
            'code' => 'verano10',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertOk()->assertJsonPath('success', true);

        $this->assertSame('VERANO10', $response->json('data.code'));
        $this->assertSame(100.0, (float) $response->json('data.subtotal'));
        $this->assertSame(25.0, (float) $response->json('data.discount'));
        $this->assertSame(75.0, (float) $response->json('data.total'));
    }

    public function test_coupon_validation_requires_authentication(): void
    {
        $product = $this->makeProduct();

        $this->postJson('/api/coupons/validate', [
            'code' => 'VERANO10',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertUnauthorized();
    }

    public function test_order_can_be_found_without_coupon(): void
    {
        $user = $this->makeUser();
        $product = $this->makeProduct();

        $this->placeOrder($user, $product)->assertCreated();

        $order = Order::firstOrFail();

        $this->assertNull($order->coupon_id);
        $this->assertNull($order->coupon_code);
        $this->assertSame('0.00', $order->discount);
    }
}
