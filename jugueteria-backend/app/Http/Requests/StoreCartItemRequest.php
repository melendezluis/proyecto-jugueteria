<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:999'],
            'variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Debes indicar el producto.',
            'product_id.exists' => 'El producto no existe.',
            'quantity.required' => 'Debes indicar la cantidad.',
            'quantity.min' => 'La cantidad mínima es 1.',
            'variant_id.exists' => 'La variante seleccionada no existe.',
        ];
    }
}
