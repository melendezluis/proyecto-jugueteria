<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'sku' => $this->sku,
            'color' => $this->color,
            'size' => $this->size,
            'stock' => $this->stock,
            'price_extra' => (float) $this->price_extra,
            'is_active' => $this->is_active,
        ];
    }
}
