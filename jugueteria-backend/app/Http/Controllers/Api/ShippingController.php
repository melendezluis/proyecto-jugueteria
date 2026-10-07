<?php

namespace App\Http\Controllers\Api;

class ShippingController
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'flat_rate' => (float) config('shipping.flat_rate'),
                'free_threshold' => config('shipping.free_threshold'),
            ],
        ]);
    }
}
