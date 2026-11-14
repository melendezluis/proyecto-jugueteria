<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\CouponValidationRequest;
use App\Services\CouponService;
use App\Services\OrderPricingService;

class CouponController
{
    public function validateCoupon(
        CouponValidationRequest $request,
        OrderPricingService $pricing,
        CouponService $coupons,
    ) {
        $validated = $request->validated();
        $pricingResult = $pricing->buildLines($validated['items']);
        $quote = $coupons->quote(
            $validated['code'],
            $pricingResult['subtotal'],
            $request->user(),
            guestEmail: $validated['guest_email'] ?? null,
        );

        return response()->json([
            'success' => true,
            'data' => [
                'code' => $quote['coupon']->code,
                'type' => $quote['coupon']->type,
                'value' => (float) $quote['coupon']->value,
                'subtotal' => $pricingResult['subtotal'],
                'discount' => $quote['discount'],
                'total' => round($pricingResult['subtotal'] - $quote['discount'], 2),
            ],
        ]);
    }
}
