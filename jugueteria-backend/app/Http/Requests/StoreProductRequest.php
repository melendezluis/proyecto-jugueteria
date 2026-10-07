<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0',
            'offer_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'sku' => 'nullable|string|max:255|unique:products,sku',
            'age_from' => 'nullable|integer|min:0',
            'age_to' => 'nullable|integer|min:0',
            'material' => 'nullable|string|max:255',
            'safety_info' => 'nullable|string',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
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
            'name.required' => 'El nombre del producto es obligatorio.',
            'price.required' => 'El precio es obligatorio.',
            'category_id.required' => 'La categoría es obligatoria.',
            'category_id.exists' => 'La categoría seleccionada no existe.',
            'brand_id.required' => 'La marca es obligatoria.',
            'brand_id.exists' => 'La marca seleccionada no existe.',
            'images.*.image' => 'Cada imagen debe ser un archivo de imagen válido.',
            'images.*.max' => 'Cada imagen no debe pesar más de :max kilobytes.',
            'variants.*.stock.required' => 'El stock de cada variante es obligatorio.',
            'variants.*.stock.integer' => 'El stock de cada variante debe ser un número entero.',
        ];
    }
}
