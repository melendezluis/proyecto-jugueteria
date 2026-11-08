<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\CouponRedemption;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\CouponService;
use App\Services\OrderPricingService;
use App\Support\Shipping;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController
{
    public function __construct(
        private OrderPricingService $pricing,
        private CouponService $coupons,
    ) {}

    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        $order = DB::transaction(function () use ($user, $validated) {
            $pricing = $this->pricing->buildLines($validated['items'], true);
            $lines = $pricing['lines'];
            $subtotal = $pricing['subtotal'];

            $deliveryMethod = $validated['delivery_method'] ?? 'shipping';
            $quote = Shipping::calculate(
                $subtotal,
                isset($validated['shipping_latitude']) ? (float) $validated['shipping_latitude'] : null,
                isset($validated['shipping_longitude']) ? (float) $validated['shipping_longitude'] : null,
            );

            if ($deliveryMethod === 'shipping' && ! $quote['available']) {
                throw ValidationException::withMessages([
                    'shipping_address' => [
                        'No hay cobertura de envío para esa ubicación (más de '
                        . config('shipping.max_radius_km')
                        . ' km desde Chancay). Puedes elegir recojo en tienda.',
                    ],
                ]);
            }

            $shipping = $deliveryMethod === 'pickup' ? 0.0 : (float) $quote['rate'];
            $coupon = null;
            $couponCode = null;
            $discount = 0.0;

            if (! empty($validated['coupon_code'])) {
                $couponQuote = $this->coupons->quote(
                    $validated['coupon_code'],
                    $subtotal,
                    $user,
                    true,
                );
                $coupon = $couponQuote['coupon'];
                $discount = $couponQuote['discount'];
                $couponCode = $coupon->code;
            }

            $total = round($subtotal - $discount + $shipping, 2);

            $order = Order::create([
                'user_id' => $user->id,
                'coupon_id' => $coupon?->id,
                'coupon_code' => $couponCode,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping' => $shipping,
                'total' => $total,
                'status' => 'pending',
                'delivery_method' => $deliveryMethod,
                'gift_wrap' => $validated['gift_wrap'] ?? false,
                'gift_message' => $validated['gift_message'] ?? null,
                'shipping_fullname' => $validated['shipping_fullname'],
                'shipping_phone' => $validated['shipping_phone'] ?? null,
                'shipping_address' => $validated['shipping_address'] ?? null,
                'shipping_address_number' => $validated['shipping_address_number'] ?? null,
                'shipping_city' => $validated['shipping_city'] ?? null,
                'shipping_latitude' => $validated['shipping_latitude'] ?? null,
                'shipping_longitude' => $validated['shipping_longitude'] ?? null,
                'shipping_notes' => $validated['shipping_notes'] ?? null,
            ]);

            if ($coupon) {
                CouponRedemption::create([
                    'coupon_id' => $coupon->id,
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'discount' => $discount,
                    'redeemed_at' => now(),
                ]);
            }

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

            $user->cart()?->delete();

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
            ],
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

    public function cancel(Request $request, $id)
    {
        $order = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Solo puedes cancelar pedidos que aún estén pendientes de pago.',
            ], 422);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Pedido cancelado correctamente.',
            'data' => new OrderResource($order->fresh('items')),
        ]);
    }
}
