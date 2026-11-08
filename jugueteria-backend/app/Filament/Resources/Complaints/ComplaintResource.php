<?php

namespace App\Filament\Resources\Complaints;

use App\Filament\Resources\Complaints\Pages\EditComplaint;
use App\Filament\Resources\Complaints\Pages\ListComplaints;
use App\Models\Complaint;
use BackedEnum;
use Filament\Actions\EditAction;
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
use Illuminate\Support\Carbon;
use UnitEnum;

class ComplaintResource extends Resource
{
    protected static ?string $model = Complaint::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDocumentText;

    protected static ?string $recordTitleAttribute = 'code';

    protected static ?string $navigationLabel = 'Reclamaciones';

    protected static ?string $modelLabel = 'Reclamación';

    protected static ?string $pluralModelLabel = 'Reclamaciones';

    protected static UnitEnum|string|null $navigationGroup = 'Atención al cliente';

    protected static ?int $navigationSort = 10;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(3)
                    ->schema([
                        TextInput::make('code')
                            ->label('Código')
                            ->disabled(),
                        TextInput::make('type')
                            ->label('Tipo')
                            ->formatStateUsing(fn (?string $state): string => $state === 'reclamo' ? 'Reclamo' : 'Queja')
                            ->disabled(),
                        TextInput::make('created_at')
                            ->label('Fecha de registro')
                            ->formatStateUsing(fn ($state): string => filled($state) ? Carbon::parse($state)->format('d/m/Y H:i') : '—')
                            ->disabled(),
                        TextInput::make('full_name')
                            ->label('Nombre completo')
                            ->disabled(),
                        TextInput::make('document_type')
                            ->label('Tipo de documento')
                            ->disabled(),
                        TextInput::make('document_number')
                            ->label('Número de documento')
                            ->disabled(),
                        TextInput::make('email')
                            ->label('Correo electrónico')
                            ->disabled(),
                        TextInput::make('phone')
                            ->label('Teléfono')
                            ->disabled(),
                        TextInput::make('order_number')
                            ->label('Número de pedido')
                            ->disabled(),
                        TextInput::make('address')
                            ->label('Domicilio')
                            ->disabled()
                            ->columnSpanFull(),
                        TextInput::make('product_service')
                            ->label('Producto o servicio')
                            ->disabled()
                            ->columnSpanFull(),
                        TextInput::make('amount')
                            ->label('Monto reclamado (S/)')
                            ->prefix('S/')
                            ->disabled(),
                        Select::make('status')
                            ->label('Estado')
                            ->options([
                                'pending' => 'Pendiente',
                                'in_review' => 'En revisión',
                                'resolved' => 'Resuelto',
                                'rejected' => 'Rechazado',
                            ])
                            ->required(),
                        TextInput::make('responded_at')
                            ->label('Fecha de respuesta')
                            ->formatStateUsing(fn ($state): string => filled($state) ? Carbon::parse($state)->format('d/m/Y H:i') : '—')
                            ->disabled(),
                    ]),
                Textarea::make('detail')
                    ->label('Detalle del reclamo o queja')
                    ->rows(5)
                    ->disabled()
                    ->columnSpanFull(),
                Textarea::make('request')
                    ->label('Pedido del consumidor')
                    ->rows(4)
                    ->disabled()
                    ->columnSpanFull(),
                Textarea::make('response')
                    ->label('Respuesta de la tienda')
                    ->rows(6)
                    ->maxLength(5000)
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('code')
            ->columns([
                TextColumn::make('code')
                    ->label('Código')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('full_name')
                    ->label('Cliente')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('type')
                    ->label('Tipo')
                    ->badge()
                    ->color(fn (string $state): string => $state === 'reclamo' ? 'danger' : 'warning')
                    ->formatStateUsing(fn (string $state): string => $state === 'reclamo' ? 'Reclamo' : 'Queja'),
                TextColumn::make('product_service')
                    ->label('Producto o servicio')
                    ->limit(35)
                    ->searchable(),
                TextColumn::make('amount')
                    ->label('Monto')
                    ->money('PEN')
                    ->placeholder('—')
                    ->sortable(),
                TextColumn::make('status')
                    ->label('Estado')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'in_review' => 'info',
                        'resolved' => 'success',
                        'rejected' => 'danger',
                        default => 'warning',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'in_review' => 'En revisión',
                        'resolved' => 'Resuelto',
                        'rejected' => 'Rechazado',
                        default => 'Pendiente',
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
                        'in_review' => 'En revisión',
                        'resolved' => 'Resuelto',
                        'rejected' => 'Rechazado',
                    ]),
                SelectFilter::make('type')
                    ->label('Tipo')
                    ->options([
                        'reclamo' => 'Reclamo',
                        'queja' => 'Queja',
                    ]),
            ])
            ->recordActions([
                EditAction::make(),
            ]);
    }

    public static function getNavigationBadge(): ?string
    {
        $pending = Complaint::query()->where('status', 'pending')->count();

        return $pending > 0 ? (string) $pending : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function getPages(): array
    {
        return [
            'index' => ListComplaints::route('/'),
            'edit' => EditComplaint::route('/{record}/edit'),
        ];
    }
}
