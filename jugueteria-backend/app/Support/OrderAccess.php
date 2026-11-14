<?php

namespace App\Support;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderAccess
{
    /**
     * @param  list<string>  $with
     */
    public static function findOrFail(Request $request, int $orderId, array $with = ['items']): Order
    {
        $token = trim((string) $request->header('X-Order-Token', $request->query('token', '')));

        if ($token !== '') {
            $order = Order::with($with)
                ->whereKey($orderId)
                ->where('guest_token_hash', hash('sha256', $token))
                ->first();

            if ($order) {
                return $order;
            }
        }

        $user = $request->user();

        if ($user) {
            return Order::with($with)
                ->whereKey($orderId)
                ->where('user_id', $user->id)
                ->firstOrFail();
        }

        abort(404);
    }
}
