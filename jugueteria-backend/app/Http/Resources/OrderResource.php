<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'guest_email' => $this->guest_email,
            'coupon_code' => $this->coupon_code,
            'subtotal' => (float) $this->subtotal,
            'discount' => (float) $this->discount,
            'shipping' => (float) $this->shipping,
            'total' => (float) $this->total,
            'status' => $this->status,
            'status_label' => $this->status_label,
            'delivery_method' => $this->delivery_method,
            'delivery_method_label' => $this->delivery_method_label,
            'gift_wrap' => (bool) $this->gift_wrap,
            'gift_message' => $this->gift_message,
            'preference_id' => $this->preference_id,
            'payment_id' => $this->payment_id,
            'payment_method' => $this->payment_method,
            'paid_at' => $this->paid_at?->toISOString(),
            'shipping_fullname' => $this->shipping_fullname,
            'shipping_phone' => $this->shipping_phone,
            'shipping_address' => $this->shipping_address,
            'shipping_address_number' => $this->shipping_address_number,
            'shipping_city' => $this->shipping_city,
            'shipping_address_full' => $this->shipping_address_full,
            'shipping_latitude' => $this->shipping_latitude !== null ? (float) $this->shipping_latitude : null,
            'shipping_longitude' => $this->shipping_longitude !== null ? (float) $this->shipping_longitude : null,
            'shipping_notes' => $this->shipping_notes,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
