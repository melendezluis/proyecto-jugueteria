<?php

namespace App\Filament\Widgets;

use App\Models\Product;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class LowStockProducts extends TableWidget
{
    protected static ?int $sort = -4;

    protected static bool $isLazy = false;

    public function table(Table $table): Table
    {
        return $table
            ->heading('Productos con stock bajo')
            ->query(fn () => Product::query()
                ->where('stock', '<=', 5)
                ->orderBy('stock')
                ->orderBy('name'))
            ->paginated(false)
            ->columns([
                TextColumn::make('name')
                    ->label('Producto'),
                TextColumn::make('sku')
                    ->label('SKU')
                    ->placeholder('—'),
                TextColumn::make('category.name')
                    ->label('Categoría'),
                TextColumn::make('stock')
                    ->label('Stock')
                    ->badge()
                    ->color(fn (int $state): string => $state <= 2 ? 'danger' : 'warning'),
            ]);
    }
}
