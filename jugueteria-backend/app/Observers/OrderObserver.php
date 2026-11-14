<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Notifications\OrderStatusNotification;
use App\Support\OrderNotifier;

class OrderObserver
{
    public function created(Order $order): void
    {
        $order->loadMissing(['user', 'items']);

        $total = number_format((float) $order->total, 2, '.', '');

        OrderNotifier::send($order, new OrderStatusNotification(
            order: $order,
            type: 'order-created',
            subject: "Pedido {$order->order_number} registrado",
            message: "Hemos recibido tu pedido {$order->order_number} por S/ {$total}. Completa el pago para confirmarlo.",
            url: "/order-confirmation/{$order->id}",
        ));
    }

    public function updating(Order $order): void
    {
        $originalStatus = $order->getOriginal('status');
        $newStatus = $order->status;

        if ($originalStatus === $newStatus) {
            return;
        }

        // Al cancelar una orden se libera el stock que estaba reservado y se avisa al cliente
        if ($newStatus === 'cancelled' && ! $order->cancelled_at) {
            $order->cancelled_at = now();
            $this->releaseStock($order);
            $this->releaseCoupon($order);

            $order->loadMissing(['user', 'items']);
            $total = number_format((float) $order->total, 2, '.', '');

            OrderNotifier::send($order, new OrderStatusNotification(
                order: $order,
                type: 'order-cancelled',
                subject: "Pedido {$order->order_number} cancelado",
                message: "Tu pedido {$order->order_number} por S/ {$total} fue cancelado y no se procesó el pago. Si igual realizaste un pago, escríbenos para ayudarte.",
                url: "/order-confirmation/{$order->id}",
            ));

            return;
        }

        if ($newStatus === 'paid' && $originalStatus !== 'paid') {
            $order->loadMissing(['user', 'items']);

            OrderNotifier::send($order, new OrderStatusNotification(
                order: $order,
                type: 'order-paid',
                subject: "¡Pago confirmado para tu pedido {$order->order_number}!",
                message: 'Ya confirmamos tu pago. Estamos preparando tu pedido.',
                url: "/order-confirmation/{$order->id}",
            ));

            return;
        }

        if ($newStatus === 'shipped' && $originalStatus !== 'shipped') {
            $order->loadMissing(['user', 'items']);

            $isPickup = $order->delivery_method === 'pickup';

            OrderNotifier::send($order, new OrderStatusNotification(
                order: $order,
                type: 'order-shipped',
                subject: $isPickup
                    ? "Tu pedido {$order->order_number} está listo para recoger"
                    : "Tu pedido {$order->order_number} está en camino",
                message: $isPickup
                    ? 'Tu pedido está listo. Puedes acercarte a la tienda para recogerlo.'
                    : "Tu pedido fue enviado. Llegará pronto a {$order->shipping_address_full}.",
                url: "/order-confirmation/{$order->id}",
            ));
        }
    }

    public function deleting(Order $order): void
    {
        // Si se elimina una orden aún en reserva, se devuelve el stock
        if ($order->status === 'pending') {
            $order->loadMissing('items');
            $this->releaseStock($order);
            $this->releaseCoupon($order);
        }
    }

    private function releaseCoupon(Order $order): void
    {
        $order->couponRedemption()
            ->whereNull('released_at')
            ->update(['released_at' => now()]);
    }

    /**
     * Devuelve al inventario la cantidad reservada por cada línea de la orden.
     */
    private function releaseStock(Order $order): void
    {
        foreach ($order->items as $item) {
            $variant = ProductVariant::query()
                ->where('product_id', $item->product_id)
                ->where('color', $item->color)
                ->where('size', $item->size)
                ->first();

            if ($variant) {
                $variant->increment('stock', $item->quantity);

                continue;
            }

            Product::query()
                ->whereKey($item->product_id)
                ->increment('stock', $item->quantity);
        }
    }
}
