<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController
{
    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        $shipping = (float) ($validated['shipping'] ?? 0);
        $subtotal = 0;
        $lines = [];

        foreach ($validated['items'] as $item) {
            $product = Product::find($item['product_id']);

            if (!$product || !$product->is_active) {
                throw ValidationException::withMessages([
                    'items' => ["El producto con ID {$item['product_id']} no está disponible."],
                ]);
            }

            $unitPrice = $product->offer_price ?? $product->price;
            $variant = null;

            if (!empty($item['variant_id'])) {
                $variant = ProductVariant::where('id', $item['variant_id'])
                    ->where('product_id', $product->id)
                    ->first();

                if (!$variant || !$variant->is_active) {
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

            $quantity = $item['quantity'];
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

        $total = round($subtotal + $shipping, 2);

        $order = DB::transaction(function () use ($request, $user, $subtotal, $shipping, $total, $lines, $validated) {
            $order = Order::create([
                'user_id' => $user->id,
                'subtotal' => $subtotal,
                'shipping' => $shipping,
                'total' => $total,
                'status' => 'pending',
                'shipping_fullname' => $validated['shipping_fullname'],
                'shipping_phone' => $validated['shipping_phone'] ?? null,
                'shipping_address' => $validated['shipping_address'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_notes' => $validated['shipping_notes'] ?? null,
            ]);

            foreach ($lines as $line) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $line['product']->id,
                    'product_name' => $line['product']->name,
                    'product_image' => $line['product']->images()->where('is_main', true)->first()?->image_path,
                    'unit_price' => $line['unit_price'],
                    'quantity' => $line['quantity'],
                    'total' => $line['total'],
                    'color' => $line['variant']?->color,
                    'size' => $line['variant']?->size,
                ]);

                if ($line['variant']) {
                    $line['variant']->decrement('stock', $line['quantity']);
                } else {
                    $line['product']->decrement('stock', $line['quantity']);
                }
            }

            return $order;
        });

        return response()->json([
            'success' => true,
            'message' => 'Pedido creado exitosamente.',
            'data' => new OrderResource($order->load('items')),
        ], 201);
    }

    public function index(Request $request)
    {
        $orders = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($orders),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => (int) $orders->perPage(),
                'total' => $orders->total(),
            ]
        ]);
    }

    public function show(Request $request, $id)
    {
        $order = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order),
        ]);
    }
}
