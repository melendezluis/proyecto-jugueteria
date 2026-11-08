<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('delivery_method')) {
            $this->merge(['delivery_method' => 'shipping']);
        }

        if ($this->has('gift_wrap')) {
            $this->merge(['gift_wrap' => $this->boolean('gift_wrap')]);
        }
    }

    public function rules(): array
    {
        return [
            'delivery_method' => ['required', Rule::in(['shipping', 'pickup'])],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'gift_wrap' => ['nullable', 'boolean'],
            'gift_message' => ['nullable', 'string', 'max:1000'],
            'shipping_fullname' => ['required', 'string', 'max:255'],
            'shipping_phone' => ['nullable', 'string', 'max:30'],
            'shipping_address' => ['required_if:delivery_method,shipping', 'nullable', 'string', 'max:500'],
            'shipping_address_number' => ['required_if:delivery_method,shipping', 'nullable', 'string', 'max:100'],
            'shipping_city' => ['nullable', 'string', 'max:255'],
            'shipping_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'shipping_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'shipping_notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
        ];
    }
}
