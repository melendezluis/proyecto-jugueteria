<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CouponService
{
    public function normalizeCode(string $code): string
    {
        return Str::upper(trim($code));
    }

    public function find(string $code, bool $lock = false): ?Coupon
    {
        return Coupon::query()
            ->where('code', $this->normalizeCode($code))
            ->when($lock, fn ($query) => $query->lockForUpdate())
            ->first();
    }

    public function validate(string $code, float $subtotal, User $user, bool $lock = false): Coupon
    {
        $coupon = $this->find($code, $lock);

        if (! $coupon) {
            $this->fail('El cupón no existe o no es válido.');
        }

        $this->assertUsable($coupon, $subtotal, $user);

        return $coupon;
    }

    public function discount(Coupon $coupon, float $subtotal): float
    {
        $discount = $coupon->type === Coupon::TYPE_PERCENTAGE
            ? $subtotal * ((float) $coupon->value / 100)
            : (float) $coupon->value;

        if ($coupon->max_discount !== null) {
            $discount = min($discount, (float) $coupon->max_discount);
        }

        return round(min($discount, $subtotal), 2);
    }

    /**
     * @return array{coupon: Coupon, discount: float}
     */
    public function quote(string $code, float $subtotal, User $user, bool $lock = false): array
    {
        $coupon = $this->validate($code, $subtotal, $user, $lock);

        return [
            'coupon' => $coupon,
            'discount' => $this->discount($coupon, $subtotal),
        ];
    }

    public function releaseForOrder(Order $order): void
    {
        $order->couponRedemption()
            ->whereNull('released_at')
            ->update(['released_at' => now()]);
    }

    private function assertUsable(Coupon $coupon, float $subtotal, User $user): void
    {
        if (! $coupon->is_active) {
            $this->fail('Este cupón no está disponible.');
        }

        if ($coupon->starts_at && $coupon->starts_at->isFuture()) {
            $this->fail('Este cupón aún no está vigente.');
        }

        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            $this->fail('Este cupón ya venció.');
        }

        if ($subtotal < (float) $coupon->min_subtotal) {
            $this->fail('Este cupón requiere una compra mínima de S/ '.number_format((float) $coupon->min_subtotal, 2).'.');
        }

        if ($coupon->usage_limit !== null) {
            $uses = $coupon->redemptions()->whereNull('released_at')->count();

            if ($uses >= $coupon->usage_limit) {
                $this->fail('Este cupón ya alcanzó su límite de usos.');
            }
        }

        if ($coupon->usage_limit_per_user !== null) {
            $userUses = $coupon->redemptions()
                ->whereNull('released_at')
                ->where('user_id', $user->id)
                ->count();

            if ($userUses >= $coupon->usage_limit_per_user) {
                $this->fail('Ya usaste este cupón.');
            }
        }

        if ($this->discount($coupon, $subtotal) <= 0) {
            $this->fail('Este cupón no aplica a tu compra.');
        }
    }

    private function fail(string $message): never
    {
        throw ValidationException::withMessages([
            'coupon_code' => [$message],
        ]);
    }
}
