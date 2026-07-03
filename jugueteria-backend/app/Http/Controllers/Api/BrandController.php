<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController
{
    public function index(Request $request)
    {
        $query = Brand::withCount('products');

        if (!$request->boolean('all')) {
            $query->where('is_active', true);
        }

        $brands = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => BrandResource::collection($brands)
        ]);
    }

    public function show($id)
    {
        $brand = Brand::withCount('products')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new BrandResource($brand)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:brands,slug',
            'description' => 'nullable|string',
            'logo' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $brand = Brand::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Marca creada exitosamente.',
            'data' => new BrandResource($brand)
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255|unique:brands,slug,' . $id,
            'description' => 'nullable|string',
            'logo' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $brand->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Marca actualizada exitosamente.',
            'data' => new BrandResource($brand)
        ]);
    }

    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);

        if ($brand->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar la marca porque tiene productos asociados.'
            ], 409);
        }

        $brand->delete();

        return response()->json([
            'success' => true,
            'message' => 'Marca eliminada exitosamente.'
        ]);
    }
}
