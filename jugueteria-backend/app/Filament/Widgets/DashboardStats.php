<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Product;
use Filament\Support\Icons\Heroicon;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class DashboardStats extends StatsOverviewWidget
{
    protected static ?int $sort = -7;

    protected static bool $isLazy = false;

    protected function getStats(): array
    {
        $ordersToday = Order::whereDate('created_at', today())->count();

        $paidQuery = Order::whereIn('status', ['paid', 'shipped', 'completed']);
        $paidTotal = (float) $paidQuery->sum('total');
        $paidCount = $paidQuery->count();

        $activeProducts = Product::where('is_active', true)->count();
        $totalProducts = Product::count();
        $lowStockProducts = Product::where('stock', '<=', 5)->count();

        return [
            Stat::make('Pedidos', number_format(Order::count()))
                ->icon(Heroicon::OutlinedClipboardDocumentList)
                ->description('+'.number_format($ordersToday).' hoy')
                ->descriptionColor('gray'),
            Stat::make('Ventas', 'S/ '.number_format($paidTotal, 2))
                ->icon(Heroicon::OutlinedCurrencyDollar)
                ->description(number_format($paidCount).' pedidos pagados')
                ->color('success'),
            Stat::make('Productos activos', number_format($activeProducts))
                ->icon(Heroicon::OutlinedCube)
                ->description('de '.number_format($totalProducts).' en el catálogo')
                ->color('primary'),
            Stat::make('Stock bajo', number_format($lowStockProducts))
                ->icon(Heroicon::OutlinedExclamationTriangle)
                ->description('con 5 unidades o menos')
                ->color($lowStockProducts > 0 ? 'danger' : 'success'),
        ];
    }
}
