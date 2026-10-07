<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class SalesChart extends ChartWidget
{
    protected static ?int $sort = -6;

    protected static bool $isLazy = false;

    protected int|string|array $columnSpan = 'full';

    protected ?string $heading = 'Ventas por día (últimos 14 días)';

    protected function getType(): string
    {
        return 'line';
    }

    protected function getData(): array
    {
        $days = collect(range(13, 0))
            ->map(fn (int $offset): Carbon => today()->subDays($offset));

        $totals = Order::whereIn('status', ['paid', 'shipped', 'completed'])
            ->whereBetween('created_at', [
                $days->first()->copy()->startOfDay(),
                $days->last()->copy()->endOfDay(),
            ])
            ->get(['total', 'created_at'])
            ->groupBy(fn (Order $order): string => $order->created_at->format('Y-m-d'));

        return [
            'datasets' => [
                [
                    'label' => 'Ventas (S/)',
                    'data' => $days
                        ->map(fn (Carbon $day): float => round(
                            (float) ($totals->get($day->format('Y-m-d'))?->sum('total') ?? 0),
                            2,
                        ))
                        ->all(),
                    'tension' => 0.3,
                ],
            ],
            'labels' => $days->map(fn (Carbon $day): string => $day->format('d/m'))->all(),
        ];
    }
}
