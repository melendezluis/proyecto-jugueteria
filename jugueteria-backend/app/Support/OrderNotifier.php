<?php

namespace App\Support;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

/**
 * Envía notificaciones al cliente sin que un fallo del canal (ej. SMTP caído
 * o mal configurado) rompa el flujo de la transacción o de la petición.
 */
class OrderNotifier
{
    public static function send(mixed $notifiable, Notification $notification): void
    {
        try {
            $notifiable->notify($notification);
        } catch (\Throwable $e) {
            Log::error('No se pudo enviar la notificación de pedido.', [
                'error' => $e->getMessage(),
                'notification' => get_class($notification),
            ]);
        }
    }
}
