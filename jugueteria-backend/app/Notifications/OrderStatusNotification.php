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
        return (new MailMessage)
            ->subject($this->subject)
            ->greeting("Hola, {$notifiable->name}!")
            ->line($this->message)
            ->action('Ver pedido', config('app.frontend_url').$this->url)
            ->line('Gracias por confiar en El Gato.');
    }
}
