<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\BrandResource;
use App\Models\Brand;
use App\Support\PublicStorage;
use Illuminate\Http\Request;

class BrandController
{
    public function index(Request $request)
    {
        $query = Brand::withCount('products');

        if (! $request->boolean('all')) {
            $query->where('is_active', true);
        }

        $brands = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => BrandResource::collection($brands),
        ]);
    }

    public function show($id)
    {
        $brand = Brand::withCount('products')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new BrandResource($brand),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules($request));

        if ($request->hasFile('logo')) {
            $validated['logo'] = PublicStorage::store($request->file('logo'), 'brands');
        } elseif (array_key_exists('logo', $validated)) {
            $validated['logo'] = PublicStorage::normalize($validated['logo']);
        }

        $brand = Brand::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Marca creada exitosamente.',
            'data' => new BrandResource($brand),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);

        $validated = $request->validate($this->rules($request, $id));

        if ($request->hasFile('logo')) {
            $validated['logo'] = PublicStorage::store($request->file('logo'), 'brands');
        } elseif (array_key_exists('logo', $validated)) {
            $validated['logo'] = PublicStorage::normalize($validated['logo']);
        }

        $brand->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Marca actualizada exitosamente.',
            'data' => new BrandResource($brand),
        ]);
    }

    private function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => ($id ? 'sometimes' : 'required').'|string|max:255',
            'slug' => 'nullable|string|max:255|unique:brands,slug'.($id ? ','.$id : ''),
            'description' => 'nullable|string',
            'logo' => $request->hasFile('logo')
                ? 'file|image|max:10240'
                : 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ];
    }

    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);

        if ($brand->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar la marca porque tiene productos asociados.',
            ], 409);
        }

        $brand->delete();

        return response()->json([
            'success' => true,
            'message' => 'Marca eliminada exitosamente.',
        ]);
    }
}
