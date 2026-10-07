<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Notifications\OrderStatusNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderNotificationTest extends TestCase
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

    private function createOrder(User $user): Order
    {
        return Order::create([
            'user_id' => $user->id,
            'subtotal' => 100,
            'shipping' => 10,
            'total' => 110,
            'status' => 'pending',
            'shipping_fullname' => 'Cliente Prueba',
            'shipping_address' => 'Av. Prueba 123',
            'shipping_city' => 'Lima',
        ]);
    }

    public function test_order_created_sends_notification(): void
    {
        Notification::fake();

        $user = $this->makeUser();
        $product = $this->makeProduct();

        Sanctum::actingAs($user);

        $this->postJson('/api/orders', [
            'shipping_fullname' => 'Cliente Prueba',
            'shipping_address' => 'Av. Prueba 123',
            'shipping_city' => 'Lima',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertCreated()->assertJsonPath('success', true);

        Notification::assertSentTo(
            $user,
            OrderStatusNotification::class,
            fn (OrderStatusNotification $notification) => $notification->type === 'order-created'
        );
    }

    public function test_mail_failure_does_not_break_checkout(): void
    {
        // Simula un servidor de correo caído o mal configurado: el canal de
        // email siempre lanza una excepción. La creación del pedido NO debe
        // fallar, quedar a medias ni dejar la transacción sin confirmar.
        Notification::extend('mail', fn () => new class
        {
            public function send($notifiable, $notification): void
            {
                throw new \RuntimeException('SMTP caído');
            }
        });

        $user = $this->makeUser();
        $product = $this->makeProduct();

        Sanctum::actingAs($user);

        $this->postJson('/api/orders', [
            'shipping_fullname' => 'Cliente Prueba',
            'shipping_address' => 'Av. Prueba 123',
            'shipping_city' => 'Lima',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertCreated()->assertJsonPath('success', true);

        // La orden existe, está pendiente y el stock se reservó correctamente.
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'status' => 'pending',
            'total' => 110,
        ]);

        $this->assertSame(4, $product->fresh()->stock);
    }

    public function test_cancel_pending_order_sends_notification(): void
    {
        Notification::fake();

        $user = $this->makeUser();
        $product = $this->makeProduct(stock: 5);

        $order = $this->createOrder($user);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => 100,
            'quantity' => 1,
            'total' => 100,
        ]);

        $product->decrement('stock', 1);

        Sanctum::actingAs($user);

        $this->postJson("/api/orders/{$order->id}/cancel")->assertOk();

        Notification::assertSentTo(
            $user,
            OrderStatusNotification::class,
            fn (OrderStatusNotification $notification) => $notification->type === 'order-cancelled'
        );

        $this->assertSame(5, $product->fresh()->stock);
    }
}
