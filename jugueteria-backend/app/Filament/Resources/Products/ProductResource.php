<?php

namespace App\Filament\Resources\Products;

use App\Filament\Resources\Products\Pages\ManageProducts;
use App\Models\Product;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'name';

    protected static ?string $navigationLabel = 'Productos';

    protected static ?string $modelLabel = 'Producto';

    protected static ?string $pluralModelLabel = 'Productos';

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
                                            ->label('Nombre')
                                            ->required()
                                            ->maxLength(255)
                                            ->live(onBlur: true)
                                            ->afterStateUpdated(function ($set, $state) {
                                                $set('slug', Str::slug($state));
                                            }),
                                        TextInput::make('slug')
                                            ->label('Slug')
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
                                        FileUpload::make('image_path')
                                            ->label('Imagen')
                                            ->disk('public')
                                            ->directory('products')
                                            ->visibility('public')
                                            ->image()
                                            ->maxSize(10240)
                                            ->imageEditor()
                                            ->required()
                                            ->columnSpanFull(),
                                        Grid::make(2)
                                            ->schema([
                                                TextInput::make('alt_text')
                                                    ->label('Texto Alternativo')
                                                    ->maxLength(255),
                                                Toggle::make('is_main')
                                                    ->label('Imagen Principal')
                                                    ->default(false),
                                            ]),
                                    ])
                                    ->orderColumn('position')
                                    ->reorderable()
                                    ->minItems(1)
                                    ->defaultItems(0)
                                    ->collapsible()
                                    ->addActionLabel('Agregar Imagen')
                                    ->mutateRelationshipDataBeforeFillUsing(
                                        fn (array $data): array => static::toFormImagePath($data)
                                    )
                                    ->mutateRelationshipDataBeforeSaveUsing(
                                        fn (array $data): array => static::toStoredImagePath($data)
                                    )
                                    ->mutateRelationshipDataBeforeCreateUsing(
                                        fn (array $data): array => static::toStoredImagePath($data)
                                    ),
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
                ImageColumn::make('image')
                    ->label('Imagen')
                    ->getStateUsing(fn (Product $record): ?string => static::previewUrl($record))
                    ->size(48)
                    ->square()
                    ->rounded()
                    ->placeholder('Sin imagen'),
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
                    ->label('Categoría')
                    ->relationship('category', 'name'),
                SelectFilter::make('brand')
                    ->label('Marca')
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

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['category', 'brand', 'images']);
    }

    protected static function toFormImagePath(array $data): array
    {
        $path = $data['image_path'] ?? null;

        if (is_string($path) && str_starts_with($path, '/storage/')) {
            $data['image_path'] = substr($path, strlen('/storage/'));
        }

        return $data;
    }

    protected static function toStoredImagePath(array $data): array
    {
        $path = $data['image_path'] ?? null;

        if (! is_string($path) || $path === '') {
            return $data;
        }

        $data['image_path'] = static::storagePath($path);

        return $data;
    }

    protected static function storagePath(string $path): string
    {
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, '/')) {
            return $path;
        }

        return '/storage/'.$path;
    }

    protected static function previewUrl(Product $record): ?string
    {
        $path = $record->images->firstWhere('is_main', true)?->image_path
            ?? $record->images->first()?->image_path;

        if (! is_string($path) || $path === '') {
            return null;
        }

        return asset(static::storagePath($path));
    }
}
