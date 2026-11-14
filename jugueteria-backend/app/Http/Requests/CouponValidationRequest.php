<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class CouponValidationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('guest_email')) {
            $this->merge(['guest_email' => Str::lower(trim((string) $this->input('guest_email')))]);
        }
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50'],
            'guest_email' => ['nullable', 'string', 'email', 'max:255'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Ingresa el código del cupón.',
            'code.max' => 'El código del cupón es demasiado largo.',
            'items.required' => 'El carrito está vacío.',
        ];
    }
}
