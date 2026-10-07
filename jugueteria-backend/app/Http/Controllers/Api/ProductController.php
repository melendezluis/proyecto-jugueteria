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

        // Búsqueda por nombre, descripción, slug, marca o categoría
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%")
                    ->orWhere('slug', 'LIKE', "%{$search}%")
                    ->orWhereHas('category', fn ($c) => $c->where('name', 'LIKE', "%{$search}%"))
                    ->orWhereHas('brand', fn ($b) => $b->where('name', 'LIKE', "%{$search}%"));
            });
        }

        // Filtro por categoría (id o slug)
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('category_slug')) {
            $query->whereHas('category', fn ($c) => $c->where('slug', $request->category_slug));
        }

        // Filtro por marca
        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        // Filtro por slugs específicos (ej. sección "Recién Llegados")
        if ($request->has('slugs')) {
            $slugs = array_filter((array) $request->query('slugs', []));
            if ($slugs !== []) {
                $query->whereIn('slug', $slugs);
            }
        }

        // Filtro por rango de precio
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filtro por rango de edad sugerida (el juguete debe cubrir la edad consultada)
        if ($request->filled('min_age')) {
            $query->where('age_to', '>=', $request->min_age);
        }
        if ($request->filled('max_age')) {
            $query->where(fn ($q) => $q->where('age_from', '<=', $request->max_age)->orWhereNull('age_from'));
        }

        // Filtro solo en oferta
        if ($request->boolean('offer')) {
            $query->whereNotNull('offer_price')->whereColumn('offer_price', '<', 'price');
        }

        // Filtro solo productos destacados
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if ($sortBy === 'discount') {
            // Porcentaje de descuento, de mayor a menor (los sin oferta van al final)
            $query->orderByRaw('(price - COALESCE(offer_price, price)) / price DESC');
        } elseif ($sortBy === 'price') {
            // Ordena por el precio efectivo (oferta si existe)
            $query->orderByRaw('COALESCE(offer_price, price) '.($sortOrder === 'asc' ? 'ASC' : 'DESC'));
        } elseif (in_array($sortBy, ['name', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $perPage = $request->integer('per_page', 12);
        $perPage = min(100, max(1, $perPage));

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
