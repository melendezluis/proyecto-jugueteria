<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;

class ExpirePendingOrders extends Command
{
    protected $signature = 'orders:expire-pending {--minutes=30 : Antigüedad máxima (en minutos) de un pedido pendiente de pago}';

    protected $description = 'Cancela pedidos pendientes de pago vencidos y libera su stock reservado';

    public function handle(): int
    {
        $cutoff = now()->subMinutes((int) $this->option('minutes'));

        $orders = Order::with('items')
            ->where('status', 'pending')
            ->where('created_at', '<', $cutoff)
            ->get();

        $cancelled = 0;

        foreach ($orders as $order) {
            $order->update(['status' => 'cancelled']);
            $cancelled++;
        }

        $this->info("Pedidos cancelados por vencimiento de pago: {$cancelled}.");

        return self::SUCCESS;
    }
}
