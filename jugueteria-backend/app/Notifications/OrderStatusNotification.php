<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Order $order,
        public string $type,
        public string $subject,
        public string $message,
        public string $url,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $name = $this->order->shipping_fullname
            ?: ($this->order->user?->name ?? 'cliente');
        $url = $this->order->guestAccessUrl(config('app.frontend_url').$this->url);

        $mail = (new MailMessage)
            ->subject($this->subject)
            ->greeting("Hola, {$name}!")
            ->line($this->message);

        if (in_array($this->type, ['order-paid', 'order-cancelled'], true)) {
            $mail->line('Detalle de tu compra:');

            foreach ($this->order->items as $item) {
                $quantity = (int) $item->quantity;
                $lineTotal = number_format((float) $item->total, 2, '.', '');

                $mail->line("{$quantity} x {$item->product_name} — S/ {$lineTotal}");
            }

            if ((float) $this->order->discount > 0) {
                $discount = number_format((float) $this->order->discount, 2, '.', '');
                $mail->line("Descuento: - S/ {$discount}");
            }

            if ((float) $this->order->shipping > 0) {
                $shipping = number_format((float) $this->order->shipping, 2, '.', '');
                $mail->line("Envío: S/ {$shipping}");
            }

            $total = number_format((float) $this->order->total, 2, '.', '');
            $mail->line("Total: S/ {$total}");
        }

        return $mail
            ->action('Ver pedido', $url)
            ->line('Gracias por confiar en El Gato.');
    }
}
