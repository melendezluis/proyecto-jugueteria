<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product');

        return [
            'name' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug,' . $productId,
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'price' => 'sometimes|numeric|min:0',
            'offer_price' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'sku' => 'nullable|string|max:255|unique:products,sku,' . $productId,
            'age_from' => 'nullable|integer|min:0',
            'age_to' => 'nullable|integer|min:0',
            'material' => 'nullable|string|max:255',
            'safety_info' => 'nullable|string',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'category_id' => 'sometimes|exists:categories,id',
            'brand_id' => 'sometimes|exists:brands,id',
        ];
    }
}
