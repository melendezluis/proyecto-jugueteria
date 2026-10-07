<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\PublicStorage;
use Illuminate\Http\Request;

class CategoryController
{
    public function index(Request $request)
    {
        $query = Category::withCount('products');

        if (! $request->boolean('all')) {
            $query->where('is_active', true);
        }

        $categories = $query->orderBy('position')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection($categories),
        ]);
    }

    public function show($id)
    {
        $category = Category::withCount('products')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new CategoryResource($category),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules($request));

        if ($request->hasFile('image')) {
            $validated['image'] = PublicStorage::store($request->file('image'), 'categories');
        } elseif (array_key_exists('image', $validated)) {
            $validated['image'] = PublicStorage::normalize($validated['image']);
        }

        $category = Category::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Categoría creada exitosamente.',
            'data' => new CategoryResource($category),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate($this->rules($request, $id));

        if ($request->hasFile('image')) {
            $validated['image'] = PublicStorage::store($request->file('image'), 'categories');
        } elseif (array_key_exists('image', $validated)) {
            $validated['image'] = PublicStorage::normalize($validated['image']);
        }

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Categoría actualizada exitosamente.',
            'data' => new CategoryResource($category),
        ]);
    }

    private function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => ($id ? 'sometimes' : 'required').'|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug'.($id ? ','.$id : ''),
            'description' => 'nullable|string',
            'image' => $request->hasFile('image')
                ? 'file|image|max:10240'
                : 'nullable|string|max:255',
            'position' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ];
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        if ($category->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar la categoría porque tiene productos asociados.',
            ], 409);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Categoría eliminada exitosamente.',
        ]);
    }
}
