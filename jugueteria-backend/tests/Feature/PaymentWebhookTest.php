<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Notifications\OrderStatusNotification;
use App\Services\MercadoPagoService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PaymentWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['mercadopago.access_token' => 'TEST-123456']);
        // El webhook exige un secreto: las notificaciones sin firma válida se rechazan
        config(['mercadopago.webhook_secret' => 'test-webhook-secret']);
    }

    /**
     * Genera los headers de firma que Mercado Pago envía en sus notificaciones,
     * de modo que la validación del webhook (HMAC-SHA256) pase en el test.
     */
    private function webhookHeaders(int|string|null $dataId): array
    {
        $requestId = 'test-request-id';
        $ts = (int) (microtime(true) * 1000);

        $parts = [];
        if ($dataId !== null) {
            $parts[] = 'id:'.$dataId;
        }
        $parts[] = 'request-id:'.$requestId;
        $parts[] = 'ts:'.$ts;

        $manifest = implode(';', $parts).';';
        $hash = hash_hmac('sha256', $manifest, config('mercadopago.webhook_secret'));

        return [
            'x-signature' => "ts={$ts},v1={$hash}",
            'x-request-id' => $requestId,
        ];
    }

    private function makeUser(): User
    {
        return User::factory()->create();
    }

    private function makeProductAndVariant(): array
    {
        $category = Category::create(['name' => 'Juguetes']);
        $brand = Brand::create(['name' => 'Genérica']);

        $product = Product::create([
            'name' => 'Peluche Gato',
            'price' => 100,
            'stock' => 5,
            'is_active' => true,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'color' => 'Rojo',
            'size' => 'M',
            'stock' => 3,
            'is_active' => true,
        ]);

        return [$product, $variant];
    }

    private function makeOrderWithVariant(User $user, Product $product, ProductVariant $variant): Order
    {
        $order = Order::create([
            'user_id' => $user->id,
            'subtotal' => 100,
            'shipping' => 10,
            'total' => 110,
            'status' => 'pending',
            'shipping_fullname' => 'Cliente Prueba',
            'shipping_address' => 'Av. Prueba 123',
            'shipping_city' => 'Lima',
        ]);

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

        return $order;
    }

    public function test_webhook_with_cancelled_payment_cancels_order_and_restores_stock(): void
    {
        Notification::fake();

        $user = $this->makeUser();
        [$product, $variant] = $this->makeProductAndVariant();
        $order = $this->makeOrderWithVariant($user, $product, $variant);

        $this->assertSame(2, $variant->fresh()->stock);

        $payment = (object) [
            'id' => '1234567890',
            'status' => 'cancelled',
            'payment_method_id' => 'account_money',
            'external_reference' => $order->order_number,
            'transaction_amount' => 110,
        ];

        $this->mock(MercadoPagoService::class, function ($mock) use ($payment) {
            $mock->shouldReceive('getPayment')
                ->once()
                ->with(1234567890)
                ->andReturn($payment);
        });

        $response = $this->postJson('/api/payment/webhook', ['data' => ['id' => 1234567890]], $this->webhookHeaders(1234567890));

        $response->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'cancelled',
        ]);

        $this->assertSame(3, $variant->fresh()->stock);

        Notification::assertSentTo(
            $user,
            OrderStatusNotification::class,
            fn (OrderStatusNotification $notification) => $notification->type === 'order-cancelled'
        );
    }

    public function test_webhook_with_approved_payment_marks_order_as_paid(): void
    {
        Notification::fake();

        $user = $this->makeUser();
        [$product, $variant] = $this->makeProductAndVariant();
        $order = $this->makeOrderWithVariant($user, $product, $variant);

        $payment = (object) [
            'id' => '9876543210',
            'status' => 'approved',
            'payment_method_id' => 'card',
            'external_reference' => $order->order_number,
            'transaction_amount' => 110,
        ];

        $this->mock(MercadoPagoService::class, function ($mock) use ($payment) {
            $mock->shouldReceive('getPayment')
                ->once()
                ->with(9876543210)
                ->andReturn($payment);
        });

        $response = $this->postJson('/api/payment/webhook', ['data' => ['id' => 9876543210]], $this->webhookHeaders(9876543210));

        $response->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'paid',
            'payment_id' => '9876543210',
            'payment_method' => 'card',
        ]);

        $this->assertNotNull($order->fresh()->paid_at);
        // La orden pagada mantiene el stock reservado
        $this->assertSame(2, $variant->fresh()->stock);

        Notification::assertSentTo(
            $user,
            OrderStatusNotification::class,
            fn (OrderStatusNotification $notification) => $notification->type === 'order-paid'
        );
    }

    public function test_webhook_with_rejected_payment_keeps_order_pending_and_notifies(): void
    {
        Notification::fake();

        $user = $this->makeUser();
        [$product, $variant] = $this->makeProductAndVariant();
        $order = $this->makeOrderWithVariant($user, $product, $variant);

        $this->assertSame(2, $variant->fresh()->stock);

        $payment = (object) [
            'id' => '555666777',
            'status' => 'rejected',
            'payment_method_id' => 'card',
            'external_reference' => $order->order_number,
            'transaction_amount' => 110,
        ];

        $this->mock(MercadoPagoService::class, function ($mock) use ($payment) {
            $mock->shouldReceive('getPayment')
                ->once()
                ->with(555666777)
                ->andReturn($payment);
        });

        $response = $this->postJson('/api/payment/webhook', ['data' => ['id' => 555666777]], $this->webhookHeaders(555666777));

        $response->assertOk()->assertJsonPath('success', true);

        // Sigue pendiente para permitir reintentos y el stock se mantiene reservado
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'pending',
            'payment_id' => '555666777',
        ]);

        $this->assertSame(2, $variant->fresh()->stock);

        Notification::assertSentTo(
            $user,
            OrderStatusNotification::class,
            fn (OrderStatusNotification $notification) => $notification->type === 'order-rejected'
        );
    }

    public function test_webhook_without_payment_id_returns_422(): void
    {
        Notification::fake();

        $this->postJson('/api/payment/webhook', [], $this->webhookHeaders(null))
            ->assertStatus(422);
    }
}
