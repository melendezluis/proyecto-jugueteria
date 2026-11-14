<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'guest_email',
        'guest_token',
        'guest_token_hash',
        'coupon_id',
        'coupon_code',
        'subtotal',
        'discount',
        'shipping',
        'total',
        'status',
        'delivery_method',
        'gift_wrap',
        'gift_message',
        'preference_id',
        'payment_id',
        'payment_method',
        'paid_at',
        'cancelled_at',
        'shipping_fullname',
        'shipping_phone',
        'shipping_address',
        'shipping_address_number',
        'shipping_city',
        'shipping_latitude',
        'shipping_longitude',
        'shipping_notes',
    ];

    protected $hidden = [
        'guest_token',
        'guest_token_hash',
    ];

    protected $casts = [
        'guest_token' => 'encrypted',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'shipping' => 'decimal:2',
        'total' => 'decimal:2',
        'gift_wrap' => 'boolean',
        'shipping_latitude' => 'decimal:7',
        'shipping_longitude' => 'decimal:7',
        'paid_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function (Order $order) {
            if (empty($order->order_number)) {
                $order->order_number = 'ELGATO-'.strtoupper(Str::random(8));
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function couponRedemption()
    {
        return $this->hasOne(CouponRedemption::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function guestAccessUrl(string $url): string
    {
        if (! $this->guest_token) {
            return $url;
        }

        $separator = str_contains($url, '?') ? '&' : '?';

        return $url.$separator.'token='.urlencode($this->guest_token);
    }

    public function getDeliveryMethodLabelAttribute()
    {
        return match ($this->delivery_method) {
            'pickup' => 'Recojo en tienda',
            default => 'Envío a domicilio',
        };
    }

    public function getShippingAddressFullAttribute(): ?string
    {
        return collect([
            $this->shipping_address,
            $this->shipping_address_number,
            $this->shipping_city,
        ])->filter()->implode(', ') ?: null;
    }

    public function getStatusLabelAttribute()
    {
        return match ($this->status) {
            'pending' => 'Pendiente',
            'paid' => 'Pagado',
            'shipped' => 'Enviado',
            'completed' => 'Completado',
            'cancelled' => 'Cancelado',
            default => $this->status,
        };
    }
}
