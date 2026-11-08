<?php

namespace App\Filament\Resources\Coupons\Schemas;

use App\Models\Coupon;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;

class CouponForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(2)
                    ->schema([
                        TextInput::make('code')
                            ->label('Código')
                            ->required()
                            ->maxLength(50)
                            ->unique(ignoreRecord: true)
                            ->dehydrateStateUsing(fn (?string $state): ?string => $state ? strtoupper(trim($state)) : null)
                            ->helperText('El cliente lo escribirá en el checkout. No distingue mayúsculas.'),
                        TextInput::make('description')
                            ->label('Descripción')
                            ->maxLength(255),
                        Select::make('type')
                            ->label('Tipo')
                            ->options([
                                Coupon::TYPE_PERCENTAGE => 'Porcentaje',
                                Coupon::TYPE_FIXED => 'Monto fijo',
                            ])
                            ->default(Coupon::TYPE_PERCENTAGE)
                            ->required(),
                        TextInput::make('value')
                            ->label('Valor (% o S/)')
                            ->numeric()
                            ->required()
                            ->minValue(0.01)
                            ->step(0.01)
                            ->helperText('Ejemplo: 10 para 10% o 20 para S/ 20.'),
                        TextInput::make('min_subtotal')
                            ->label('Compra mínima')
                            ->numeric()
                            ->minValue(0)
                            ->default(0)
                            ->prefix('S/'),
                        TextInput::make('max_discount')
                            ->label('Tope de descuento')
                            ->numeric()
                            ->minValue(0)
                            ->prefix('S/')
                            ->helperText('Opcional. Solo se aplica a cupones por porcentaje.'),
                        TextInput::make('usage_limit')
                            ->label('Límite total de usos')
                            ->integer()
                            ->minValue(1)
                            ->helperText('Dejar vacío para sin límite.'),
                        TextInput::make('usage_limit_per_user')
                            ->label('Límite por cliente')
                            ->integer()
                            ->minValue(1)
                            ->helperText('Dejar vacío para sin límite.'),
                        DateTimePicker::make('starts_at')
                            ->label('Vigente desde')
                            ->seconds(false),
                        DateTimePicker::make('expires_at')
                            ->label('Vigente hasta')
                            ->seconds(false)
                            ->after('starts_at'),
                        Toggle::make('is_active')
                            ->label('Activo')
                            ->default(true),
                    ]),
            ]);
    }
}
