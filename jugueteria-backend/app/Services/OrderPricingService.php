<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Validation\ValidationException;

class OrderPricingService
{
    /**
     * @return array{lines: array<int, array<string, mixed>>, subtotal: float}
     */
    public function buildLines(array $items, bool $lock = false): array
    {
        $subtotal = 0.0;
        $lines = [];

        foreach ($items as $item) {
            $product = Product::query()
                ->where('id', $item['product_id'])
                ->when($lock, fn ($query) => $query->lockForUpdate())
                ->first();

            if (! $product || ! $product->is_active) {
                throw ValidationException::withMessages([
                    'items' => ["El producto con ID {$item['product_id']} no está disponible."],
                ]);
            }

            $unitPrice = (float) ($product->offer_price ?? $product->price);
            $variant = null;

            if (! empty($item['variant_id'])) {
                $variant = ProductVariant::query()
                    ->where('id', $item['variant_id'])
                    ->where('product_id', $product->id)
                    ->when($lock, fn ($query) => $query->lockForUpdate())
                    ->first();

                if (! $variant || ! $variant->is_active) {
                    throw ValidationException::withMessages([
                        'items' => ["La variante del producto {$product->name} no está disponible."],
                    ]);
                }

                if ($variant->stock < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => ["Stock insuficiente para la variante de {$product->name}."],
                    ]);
                }

                $unitPrice += (float) $variant->price_extra;
            } elseif ($product->stock < $item['quantity']) {
                throw ValidationException::withMessages([
                    'items' => ["Stock insuficiente para {$product->name} (disponible: {$product->stock})."],
                ]);
            }

            $quantity = (int) $item['quantity'];
            $lineTotal = round($unitPrice * $quantity, 2);
            $subtotal += $lineTotal;

            $lines[] = [
                'product' => $product,
                'variant' => $variant,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'total' => $lineTotal,
            ];
        }

        return [
            'lines' => $lines,
            'subtotal' => round($subtotal, 2),
        ];
    }
}
