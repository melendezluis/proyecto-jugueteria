<?php

namespace App\Filament\Resources\Orders;

use App\Filament\Resources\Orders\Pages\EditOrder;
use App\Filament\Resources\Orders\Pages\ListOrders;
use App\Models\Order;
use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use UnitEnum;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShoppingCart;

    protected static ?string $recordTitleAttribute = 'order_number';

    protected static ?string $navigationLabel = 'Órdenes';

    protected static ?string $modelLabel = 'Orden';

    protected static ?string $pluralModelLabel = 'Órdenes';

    protected static UnitEnum|string|null $navigationGroup = 'Ventas';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(2)
                    ->schema([
                        TextInput::make('order_number')
                            ->label('N° de Orden')
                            ->disabled(),
                        TextInput::make('user.name')
                            ->label('Cliente')
                            ->disabled(),
                        TextInput::make('subtotal')
                            ->label('Subtotal (S/)')
                            ->disabled()
                            ->prefix('S/'),
                        TextInput::make('shipping')
                            ->label('Envío (S/)')
                            ->disabled()
                            ->prefix('S/'),
                        TextInput::make('total')
                            ->label('Total (S/)')
                            ->disabled()
                            ->prefix('S/'),
                        Select::make('status')
                            ->label('Estado')
                            ->options([
                                'pending' => 'Pendiente',
                                'paid' => 'Pagado',
                                'shipped' => 'Enviado',
                                'completed' => 'Completado',
                                'cancelled' => 'Cancelado',
                            ]),
                    ]),
                Grid::make(2)
                    ->schema([
                        TextInput::make('shipping_fullname')
                            ->label('Destinatario')
                            ->disabled(),
                        TextInput::make('shipping_phone')
                            ->label('Teléfono')
                            ->disabled(),
                        TextInput::make('shipping_address')
                            ->label('Dirección')
                            ->disabled()
                            ->columnSpanFull(),
                        TextInput::make('shipping_city')
                            ->label('Ciudad')
                            ->disabled(),
                        Textarea::make('shipping_notes')
                            ->label('Notas de envío')
                            ->disabled(),
                    ]),
                Repeater::make('items')
                    ->label('Productos')
                    ->relationship()
                    ->schema([
                        TextInput::make('product_name')
                            ->label('Producto')
                            ->disabled(),
                        TextInput::make('quantity')
                            ->label('Cantidad')
                            ->disabled(),
                        TextInput::make('unit_price')
                            ->label('Precio Unitario (S/)')
                            ->disabled(),
                        TextInput::make('total')
                            ->label('Total (S/)')
                            ->disabled(),
                    ])
                    ->disabled()
                    ->deletable(false)
                    ->addable(false)
                    ->reorderable(false)
                    ->defaultItems(0),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('order_number')
            ->columns([
                TextColumn::make('order_number')
                    ->label('N° de Orden')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('user.name')
                    ->label('Cliente')
                    ->searchable(),
                TextColumn::make('items_count')
                    ->label('Productos')
                    ->counts('items'),
                TextColumn::make('total')
                    ->label('Total')
                    ->money('PEN')
                    ->sortable(),
                TextColumn::make('status')
                    ->label('Estado')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'paid' => 'info',
                        'shipped' => 'primary',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'Pendiente',
                        'paid' => 'Pagado',
                        'shipped' => 'Enviado',
                        'completed' => 'Completado',
                        'cancelled' => 'Cancelado',
                        default => $state,
                    }),
                TextColumn::make('created_at')
                    ->label('Fecha')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('status')
                    ->label('Estado')
                    ->options([
                        'pending' => 'Pendiente',
                        'paid' => 'Pagado',
                        'shipped' => 'Enviado',
                        'completed' => 'Completado',
                        'cancelled' => 'Cancelado',
                    ]),
            ])
            ->recordActions([
                EditAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListOrders::route('/'),
            'edit' => EditOrder::route('/{record}/edit'),
        ];
    }
}
