<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Support\PublicStorage;
use Illuminate\Http\Request;

class ProductController
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'variants', 'images']);

        // Filtro solo mostrar activos (a menos que se pida explícitamente todos)
        if (! $request->boolean('all')) {
            $query->where('is_active', true);
        }

        // Búsqueda por nombre o descripción
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Filtro por categoría
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filtro por marca
        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        // Filtro por rango de precio
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if (in_array($sortBy, ['price', 'name', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $perPage = $request->get('per_page', 12);

        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => (int) $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'brand', 'variants', 'images'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product),
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $product = Product::create(
            $request->safe()->except(['images', 'image_alts', 'variants'])
        );

        $this->syncImages($product, $request);
        $this->syncVariants($product, $request);

        return response()->json([
            'success' => true,
            'message' => 'Producto creado exitosamente.',
            'data' => new ProductResource($product->load(['category', 'brand', 'images', 'variants'])),
        ], 201);
    }

    public function update(UpdateProductRequest $request, $id)
    {
        $product = Product::findOrFail($id);

        $product->update(
            $request->safe()->except(['images', 'image_alts', 'variants'])
        );

        if ($request->has('images')) {
            $this->syncImages($product, $request, replace: true);
        }

        if ($request->has('variants')) {
            $this->syncVariants($product, $request, replace: true);
        }

        return response()->json([
            'success' => true,
            'message' => 'Producto actualizado exitosamente.',
            'data' => new ProductResource($product->load(['category', 'brand', 'images', 'variants'])),
        ]);
    }

    /**
     * Guarda las imágenes subidas en `products/` y sus filas en `product_images`.
     * Con `replace` elimina las imágenes anteriores (el modelo borra el archivo en disco).
     */
    private function syncImages(Product $product, Request $request, bool $replace = false): void
    {
        if ($replace) {
            foreach ($product->images()->get() as $image) {
                $image->delete();
            }
        }

        $files = $request->file('images');
        $files = is_array($files) ? array_values($files) : [];

        if ($files === []) {
            return;
        }

        $alts = $request->input('image_alts');
        $alts = is_array($alts) ? array_values($alts) : [];

        foreach ($files as $index => $file) {
            $product->images()->create([
                'image_path' => PublicStorage::store($file, 'products'),
                'alt_text' => $alts[$index] ?? null,
                'position' => $index + 1,
                'is_main' => $index === 0,
            ]);
        }
    }

    /**
     * Con `replace` reemplaza todas las variantes por las enviadas en `variants`.
     */
    private function syncVariants(Product $product, Request $request, bool $replace = false): void
    {
        if ($replace) {
            $product->variants()->delete();
        }

        $variants = $request->input('variants');
        $variants = is_array($variants) ? array_values($variants) : [];

        if ($variants === []) {
            return;
        }

        foreach ($variants as $variant) {
            $product->variants()->create([
                'sku' => $variant['sku'] ?? null,
                'color' => $variant['color'] ?? null,
                'size' => $variant['size'] ?? null,
                'stock' => (int) ($variant['stock'] ?? 0),
                'price_extra' => (float) ($variant['price_extra'] ?? 0),
                'is_active' => filter_var($variant['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? true,
            ]);
        }
    }

    public function bySlug($slug)
    {
        $product = Product::with(['category', 'brand', 'variants', 'images'])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product),
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado exitosamente.',
        ]);
    }
}
