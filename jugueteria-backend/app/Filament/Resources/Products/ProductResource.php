<?php

namespace App\Filament\Resources\Products;

use App\Filament\Resources\Products\Pages\ManageProducts;
use App\Models\Product;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Tabs;
use Filament\Forms\Components\Tabs\Tab;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make()
                    ->tabs([
                        Tab::make('Información General')
                            ->schema([
                                Grid::make(2)
                                    ->schema([
                                        TextInput::make('name')
                                            ->required()
                                            ->maxLength(255)
                                            ->live(onBlur: true)
                                            ->afterStateUpdated(function ($set, $state) {
                                                $set('slug', \Illuminate\Support\Str::slug($state));
                                            }),
                                        TextInput::make('slug')
                                            ->required()
                                            ->maxLength(255)
                                            ->unique(ignoreRecord: true),
                                    ]),
                                Grid::make(2)
                                    ->schema([
                                        Select::make('category_id')
                                            ->label('Categoría')
                                            ->relationship('category', 'name')
                                            ->searchable()
                                            ->preload()
                                            ->required(),
                                        Select::make('brand_id')
                                            ->label('Marca')
                                            ->relationship('brand', 'name')
                                            ->searchable()
                                            ->preload()
                                            ->required(),
                                    ]),
                                RichEditor::make('description')
                                    ->label('Descripción'),
                                Textarea::make('short_description')
                                    ->label('Descripción Corta')
                                    ->maxLength(500)
                                    ->rows(3),
                            ]),
                        Tab::make('Precio y Stock')
                            ->schema([
                                Grid::make(3)
                                    ->schema([
                                        TextInput::make('price')
                                            ->label('Precio (S/)')
                                            ->numeric()
                                            ->minValue(0)
                                            ->required()
                                            ->prefix('S/'),
                                        TextInput::make('offer_price')
                                            ->label('Precio Oferta (S/)')
                                            ->numeric()
                                            ->minValue(0)
                                            ->prefix('S/'),
                                        TextInput::make('stock')
                                            ->label('Stock')
                                            ->numeric()
                                            ->minValue(0)
                                            ->default(0),
                                    ]),
                                Grid::make(2)
                                    ->schema([
                                        TextInput::make('sku')
                                            ->label('SKU')
                                            ->maxLength(255)
                                            ->unique(ignoreRecord: true),
                                    ]),
                            ]),
                        Tab::make('Especificaciones')
                            ->schema([
                                Grid::make(2)
                                    ->schema([
                                        TextInput::make('age_from')
                                            ->label('Edad Mínima')
                                            ->numeric()
                                            ->minValue(0),
                                        TextInput::make('age_to')
                                            ->label('Edad Máxima')
                                            ->numeric()
                                            ->minValue(0),
                                    ]),
                                Grid::make(2)
                                    ->schema([
                                        TextInput::make('material')
                                            ->label('Material')
                                            ->maxLength(255),
                                        Textarea::make('safety_info')
                                            ->label('Información de Seguridad')
                                            ->rows(3),
                                    ]),
                            ]),
                        Tab::make('Variantes')
                            ->schema([
                                Repeater::make('variants')
                                    ->relationship()
                                    ->schema([
                                        Grid::make(4)
                                            ->schema([
                                                TextInput::make('sku')
                                                    ->label('SKU')
                                                    ->maxLength(255),
                                                TextInput::make('color')
                                                    ->label('Color')
                                                    ->maxLength(255),
                                                TextInput::make('size')
                                                    ->label('Talla/Tamaño')
                                                    ->maxLength(255),
                                                TextInput::make('stock')
                                                    ->label('Stock')
                                                    ->numeric()
                                                    ->minValue(0)
                                                    ->default(0),
                                                TextInput::make('price_extra')
                                                    ->label('Precio Adicional (S/)')
                                                    ->numeric()
                                                    ->minValue(0)
                                                    ->default(0)
                                                    ->prefix('S/'),
                                                Toggle::make('is_active')
                                                    ->label('Activo')
                                                    ->default(true),
                                            ]),
                                    ])
                                    ->defaultItems(0)
                                    ->collapsible()
                                    ->addActionLabel('Agregar Variante'),
                            ]),
                        Tab::make('Imágenes')
                            ->schema([
                                Repeater::make('images')
                                    ->relationship()
                                    ->schema([
                                        Grid::make(4)
                                            ->schema([
                                                TextInput::make('image_path')
                                                    ->label('Ruta de Imagen')
                                                    ->required()
                                                    ->maxLength(255),
                                                TextInput::make('alt_text')
                                                    ->label('Texto Alternativo')
                                                    ->maxLength(255),
                                                TextInput::make('position')
                                                    ->label('Posición')
                                                    ->numeric()
                                                    ->default(0),
                                                Toggle::make('is_main')
                                                    ->label('Principal')
                                                    ->default(false),
                                            ]),
                                    ])
                                    ->defaultItems(0)
                                    ->collapsible()
                                    ->addActionLabel('Agregar Imagen'),
                            ]),
                        Tab::make('Estado')
                            ->schema([
                                Grid::make(2)
                                    ->schema([
                                        Toggle::make('is_featured')
                                            ->label('Destacado'),
                                        Toggle::make('is_active')
                                            ->label('Activo')
                                            ->default(true),
                                    ]),
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                TextColumn::make('name')
                    ->label('Nombre')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('category.name')
                    ->label('Categoría')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('brand.name')
                    ->label('Marca')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('price')
                    ->label('Precio')
                    ->money('PEN')
                    ->sortable(),
                TextColumn::make('stock')
                    ->label('Stock')
                    ->sortable(),
                IconColumn::make('is_active')
                    ->label('Activo')
                    ->boolean(),
                IconColumn::make('is_featured')
                    ->label('Destacado')
                    ->boolean(),
            ])
            ->filters([
                SelectFilter::make('category')
                    ->relationship('category', 'name'),
                SelectFilter::make('brand')
                    ->relationship('brand', 'name'),
            ])
            ->defaultSort('created_at', 'desc')
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ManageProducts::route('/'),
        ];
    }
}
