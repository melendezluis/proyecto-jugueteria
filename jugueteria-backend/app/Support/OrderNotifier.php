<?php

namespace App\Support;

use App\Models\Order;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification as NotificationFacade;

class OrderNotifier
{
    public static function send(Order $order, Notification $notification): void
    {
        try {
            if ($order->user) {
                $order->user->notify($notification);

                return;
            }

            if ($order->guest_email) {
                NotificationFacade::route('mail', $order->guest_email)->notify($notification);
            }
        } catch (\Throwable $e) {
            Log::error('No se pudo enviar la notificación de pedido.', [
                'error' => $e->getMessage(),
                'notification' => get_class($notification),
                'order_id' => $order->id,
            ]);
        }
    }
}
