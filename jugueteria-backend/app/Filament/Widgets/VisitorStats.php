<?php

namespace App\Filament\Widgets;

use App\Models\PageVisit;
use Filament\Support\Icons\Heroicon;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class VisitorStats extends StatsOverviewWidget
{
    protected static ?int $sort = -8;

    protected static bool $isLazy = false;

    protected function getStats(): array
    {
        $today = now()->startOfDay();
        $todayEnd = now()->endOfDay();
        $weekStart = now()->subDays(6)->startOfDay();
        $onlineSince = now()->subMinutes(5);

        $totalVisits = PageVisit::count();
        $totalVisitors = PageVisit::distinct()->count('visitor_hash');

        $todayVisits = PageVisit::whereBetween('visited_at', [$today, $todayEnd])->count();
        $todayVisitors = PageVisit::whereBetween('visited_at', [$today, $todayEnd])
            ->distinct()
            ->count('visitor_hash');

        $weekVisits = PageVisit::whereBetween('visited_at', [$weekStart, $todayEnd])->count();
        $weekVisitors = PageVisit::whereBetween('visited_at', [$weekStart, $todayEnd])
            ->distinct()
            ->count('visitor_hash');

        $onlineVisitors = PageVisit::where('visited_at', '>=', $onlineSince)
            ->distinct()
            ->count('visitor_hash');

        return [
            Stat::make('Visitas hoy', number_format($todayVisits))
                ->icon(Heroicon::OutlinedEye)
                ->description(number_format($totalVisits).' visitas en total')
                ->descriptionColor('gray'),
            Stat::make('Visitantes únicos hoy', number_format($todayVisitors))
                ->icon(Heroicon::OutlinedUsers)
                ->description(number_format($totalVisitors).' en total')
                ->color('primary'),
            Stat::make('Visitas · últimos 7 días', number_format($weekVisits))
                ->icon(Heroicon::OutlinedChartBar)
                ->description(number_format($weekVisitors).' visitantes únicos')
                ->color('success'),
            Stat::make('En línea ahora', number_format($onlineVisitors))
                ->icon(Heroicon::OutlinedBolt)
                ->description('En los últimos 5 minutos')
                ->color($onlineVisitors > 0 ? 'success' : 'gray'),
        ];
    }
}
