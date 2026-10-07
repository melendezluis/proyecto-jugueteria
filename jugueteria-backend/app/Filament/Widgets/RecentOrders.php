<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class RecentOrders extends TableWidget
{
    protected static ?int $sort = -5;

    protected static bool $isLazy = false;

    public function table(Table $table): Table
    {
        return $table
            ->heading('Últimos pedidos')
            ->query(fn () => Order::query()->latest('created_at')->limit(6))
            ->paginated(false)
            ->columns([
                TextColumn::make('order_number')
                    ->label('Pedido'),
                TextColumn::make('user.name')
                    ->label('Cliente')
                    ->placeholder('—'),
                TextColumn::make('status')
                    ->label('Estado')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'Pendiente',
                        'paid' => 'Pagado',
                        'shipped' => 'Enviado',
                        'completed' => 'Completado',
                        'cancelled' => 'Cancelado',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'paid' => 'success',
                        'shipped' => 'info',
                        'completed' => 'primary',
                        'cancelled' => 'danger',
                        default => 'gray',
                    }),
                TextColumn::make('total')
                    ->label('Total (S/)')
                    ->formatStateUsing(fn ($state): string => 'S/ '.number_format((float) $state, 2)),
                TextColumn::make('created_at')
                    ->label('Fecha')
                    ->dateTime('d/m/Y H:i'),
            ]);
    }
}
