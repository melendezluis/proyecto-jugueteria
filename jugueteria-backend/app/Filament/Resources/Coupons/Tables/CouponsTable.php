<?php

namespace App\Filament\Resources\Coupons\Tables;

use App\Models\Coupon;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class CouponsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('code')
            ->columns([
                TextColumn::make('code')
                    ->label('Código')
                    ->copyable()
                    ->searchable()
                    ->sortable(),
                TextColumn::make('type')
                    ->label('Tipo')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => $state === Coupon::TYPE_PERCENTAGE ? 'Porcentaje' : 'Monto fijo'),
                TextColumn::make('value')
                    ->label('Valor')
                    ->formatStateUsing(fn ($state, Coupon $record): string => $record->formatted_value),
                TextColumn::make('min_subtotal')
                    ->label('Mínimo')
                    ->money('PEN')
                    ->sortable(),
                TextColumn::make('active_redemptions_count')
                    ->label('Usos')
                    ->counts('activeRedemptions')
                    ->formatStateUsing(fn ($state, Coupon $record): string => $record->usage_limit
                        ? "{$state} / {$record->usage_limit}"
                        : (string) $state),
                TextColumn::make('starts_at')
                    ->label('Desde')
                    ->dateTime('d/m/Y H:i')
                    ->placeholder('Sin fecha')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('expires_at')
                    ->label('Hasta')
                    ->dateTime('d/m/Y H:i')
                    ->placeholder('Sin vencimiento')
                    ->sortable(),
                TextColumn::make('is_active')
                    ->label('Estado')
                    ->badge()
                    ->formatStateUsing(fn (bool $state): string => $state ? 'Activo' : 'Inactivo')
                    ->color(fn (bool $state): string => $state ? 'success' : 'gray'),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('is_active')
                    ->label('Estado')
                    ->options([
                        '1' => 'Activos',
                        '0' => 'Inactivos',
                    ]),
                SelectFilter::make('type')
                    ->label('Tipo')
                    ->options([
                        Coupon::TYPE_PERCENTAGE => 'Porcentaje',
                        Coupon::TYPE_FIXED => 'Monto fijo',
                    ]),
            ])
            ->recordActions([
                EditAction::make(),
            ]);
    }
}
