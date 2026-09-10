<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreCartItemRequest;
use App\Http\Requests\SyncCartRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CartController
{
    private function getOrCreateCart(User $user): Cart
    {
        return Cart::forUser($user->id);
    }

    private function cartResponse(Cart $cart)
    {
        $cart->load([
            'items.product.category',
            'items.product.brand',
            'items.product.images',
            'items.product.variants',
            'items.variant',
        ]);

        return response()->json([
            'success' => true,
            'data' => new CartResource($cart),
        ]);
    }

    public function show(Request $request)
    {
        return $this->cartResponse($this->getOrCreateCart($request->user()));
    }

    public function addItem(StoreCartItemRequest $request)
    {
        $validated = $request->validated();
        $cart = $this->getOrCreateCart($request->user());

        $product = Product::where('id', $validated['product_id'])->where('is_active', true)->first();
        if (! $product) {
            throw ValidationException::withMessages([
                'product_id' => ['El producto no está disponible.'],
            ]);
        }

        $variant = null;
        $availableStock = $product->stock;

        if (! empty($validated['variant_id'])) {
            $variant = ProductVariant::where('id', $validated['variant_id'])
                ->where('product_id', $product->id)
                ->where('is_active', true)
                ->first();

            if (! $variant) {
                throw ValidationException::withMessages([
                    'variant_id' => ['La variante seleccionada no está disponible.'],
                ]);
            }
            $availableStock = $variant->stock;
        }

        $quantity = min($validated['quantity'], $availableStock);
        if ($quantity <= 0) {
            throw ValidationException::withMessages([
                'quantity' => ["No hay stock disponible para {$product->name}."],
            ]);
        }

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->where('product_variant_id', $variant?->id)
            ->first();

        if ($cartItem) {
            $cartItem->update([
                'quantity' => min($cartItem->quantity + $quantity, $availableStock),
            ]);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'product_variant_id' => $variant?->id,
                'quantity' => $quantity,
            ]);
        }

        return $this->cartResponse($cart);
    }

    public function updateItem(UpdateCartItemRequest $request, $id)
    {
        $cart = $this->getOrCreateCart($request->user());
        $cartItem = $cart->items()->with(['product', 'variant'])->findOrFail($id);

        $quantity = $request->validated('quantity');
        $availableStock = $cartItem->variant ? $cartItem->variant->stock : $cartItem->product->stock;

        if ($availableStock <= 0) {
            $cartItem->delete();
        } else {
            $cartItem->update(['quantity' => min($quantity, $availableStock)]);
        }

        return $this->cartResponse($cart);
    }

    public function removeItem(Request $request, $id)
    {
        $cart = $this->getOrCreateCart($request->user());
        $cart->items()->findOrFail($id)->delete();

        return $this->cartResponse($cart);
    }

    public function sync(SyncCartRequest $request)
    {
        $cart = $this->getOrCreateCart($request->user());

        foreach ($request->validated('items') as $item) {
            $product = Product::where('id', $item['product_id'])->where('is_active', true)->first();
            if (! $product) {
                continue;
            }

            $variant = null;
            $availableStock = $product->stock;

            if (! empty($item['variant_id'])) {
                $variant = ProductVariant::where('id', $item['variant_id'])
                    ->where('product_id', $product->id)
                    ->where('is_active', true)
                    ->first();

                if (! $variant) {
                    continue;
                }
                $availableStock = $variant->stock;
            }

            if ($availableStock <= 0) {
                continue;
            }

            $cartItem = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $product->id)
                ->where('product_variant_id', $variant?->id)
                ->first();

            if ($cartItem) {
                $cartItem->update([
                    'quantity' => min($cartItem->quantity + $item['quantity'], $availableStock),
                ]);
            } else {
                CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'quantity' => min($item['quantity'], $availableStock),
                ]);
            }
        }

        return $this->cartResponse($cart);
    }

    public function destroy(Request $request)
    {
        $cart = $this->getOrCreateCart($request->user());
        $cart->items()->delete();

        return $this->cartResponse($cart);
    }
}
