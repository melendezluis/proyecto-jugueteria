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
                'local_rate' => (float) config('shipping.local_rate'),
                'nearby_rate' => (float) config('shipping.nearby_rate'),
                'local_radius_km' => (float) config('shipping.local_radius_km'),
                'max_radius_km' => (float) config('shipping.max_radius_km'),
                'center' => [
                    'lat' => (float) config('shipping.center.lat'),
                    'lng' => (float) config('shipping.center.lng'),
                ],
            ],
        ]);
    }
}
