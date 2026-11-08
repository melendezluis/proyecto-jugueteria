<?php

namespace App\Filament\Resources\Coupons\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class RedemptionsRelationManager extends RelationManager
{
    protected static string $relationship = 'redemptions';

    protected static ?string $title = 'Usos del cupón';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('id')
            ->columns([
                TextColumn::make('order.order_number')
                    ->label('Pedido')
                    ->searchable(),
                TextColumn::make('user.name')
                    ->label('Cliente')
                    ->searchable(),
                TextColumn::make('user.email')
                    ->label('Correo')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('discount')
                    ->label('Descuento')
                    ->money('PEN'),
                TextColumn::make('redeemed_at')
                    ->label('Usado el')
                    ->dateTime('d/m/Y H:i'),
                TextColumn::make('released_at')
                    ->label('Liberado el')
                    ->dateTime('d/m/Y H:i')
                    ->placeholder('Uso vigente'),
            ])
            ->defaultSort('redeemed_at', 'desc');
    }
}
