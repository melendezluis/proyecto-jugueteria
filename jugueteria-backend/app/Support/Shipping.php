<?php

namespace App\Support;

final class Shipping
{
    public static function calculate(float $subtotal): float
    {
        if ($subtotal <= 0) {
            return 0.0;
        }

        $freeThreshold = config('shipping.free_threshold');

        if ($freeThreshold !== null && $subtotal >= $freeThreshold) {
            return 0.0;
        }

        return (float) config('shipping.flat_rate');
    }
}
