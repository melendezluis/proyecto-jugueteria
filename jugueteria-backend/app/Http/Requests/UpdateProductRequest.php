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
        $productId = $this->route('id');

        return [
            'name' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug,'.$productId,
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'price' => 'sometimes|numeric|min:0',
            'offer_price' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'sku' => 'nullable|string|max:255|unique:products,sku,'.$productId,
            'age_from' => 'nullable|integer|min:0',
            'age_to' => 'nullable|integer|min:0',
            'material' => 'nullable|string|max:255',
            'safety_info' => 'nullable|string',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'category_id' => 'sometimes|exists:categories,id',
            'brand_id' => 'sometimes|exists:brands,id',
            'images' => 'nullable|array',
            'images.*' => 'file|image|max:10240',
            'image_alts' => 'nullable|array',
            'image_alts.*' => 'nullable|string|max:255',
            'variants' => 'nullable|array',
            'variants.*.sku' => 'nullable|string|max:255',
            'variants.*.color' => 'nullable|string|max:255',
            'variants.*.size' => 'nullable|string|max:255',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.price_extra' => 'nullable|numeric|min:0',
            'variants.*.is_active' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'images.*.image' => 'Cada imagen debe ser un archivo de imagen válido.',
            'images.*.max' => 'Cada imagen no debe pesar más de :max kilobytes.',
            'variants.*.stock.required' => 'El stock de cada variante es obligatorio.',
            'variants.*.stock.integer' => 'El stock de cada variante debe ser un número entero.',
        ];
    }
}
