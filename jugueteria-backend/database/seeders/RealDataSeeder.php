<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class RealDataSeeder extends Seeder
{
    private array $productIds = [];

    public function run(): void
    {
        $data = require __DIR__ . '/real_data.php';

        $this->seedCategories($data['categories'] ?? []);
        $this->seedBrands($data['brands'] ?? []);
        $this->seedProducts($data['products'] ?? []);
        $this->seedUsers($data['users'] ?? []);
        $this->seedOrders($data['orders'] ?? []);
        $this->restoreImageFiles($data['products'] ?? []);

        echo "✅ Datos reales cargados exitosamente!\n";
    }

    private function seedCategories(array $rows): void
    {
        foreach ($rows as $row) {
            $category = Category::firstOrCreate(
                ['slug' => $row['slug']],
                collect($row)->except('slug', 'created_at', 'updated_at')->all()
            );
            $this->applyTimestamps($category, $row);
        }
    }

    private function seedBrands(array $rows): void
    {
        foreach ($rows as $row) {
            $brand = Brand::firstOrCreate(
                ['slug' => $row['slug']],
                collect($row)->except('slug', 'created_at', 'updated_at')->all()
            );
            $this->applyTimestamps($brand, $row);
        }
    }

    private function seedProducts(array $rows): void
    {
        foreach ($rows as $row) {
            $category = Category::where('slug', $row['category_slug'])->first();
            $brand = Brand::where('slug', $row['brand_slug'])->first();

            $product = Product::firstOrCreate(
                ['slug' => $row['slug']],
                collect($row)->except('slug', 'category_slug', 'brand_slug', 'images', 'variants', 'created_at', 'updated_at')->all() + [
                    'category_id' => $category?->id,
                    'brand_id' => $brand?->id,
                ]
            );
            $this->applyTimestamps($product, $row);
            $this->productIds[$row['slug']] = $product->id;

            $this->seedImages($product, $row['images'] ?? []);
            $this->seedVariants($product, $row['variants'] ?? []);
        }
    }

    private function seedImages(Product $product, array $rows): void
    {
        foreach ($rows as $row) {
            $image = ProductImage::firstOrCreate(
                ['product_id' => $product->id, 'position' => $row['position']],
                collect($row)->except('position', 'created_at', 'updated_at')->all()
            );
            $this->applyTimestamps($image, $row);
        }
    }

    private function seedVariants(Product $product, array $rows): void
    {
        foreach ($rows as $row) {
            $match = ['product_id' => $product->id];
            if (! empty($row['sku'])) {
                $match['sku'] = $row['sku'];
            } else {
                $match['color'] = $row['color'] ?? null;
                $match['size'] = $row['size'] ?? null;
            }

            $variant = ProductVariant::firstOrCreate(
                $match,
                collect($row)->except('sku', 'color', 'size', 'created_at', 'updated_at')->all()
            );
            $this->applyTimestamps($variant, $row);
        }
    }

    private function seedUsers(array $rows): void
    {
        foreach ($rows as $row) {
            $roles = $row['roles'] ?? [];

            $user = User::firstOrCreate(
                ['email' => $row['email']],
                collect($row)->except('email', 'roles', 'created_at', 'updated_at')->all()
            );
            $this->applyTimestamps($user, $row);

            if ($roles) {
                $user->syncRoles($roles);
            }
        }
    }

    private function seedOrders(array $rows): void
    {
        foreach ($rows as $row) {
            $user = User::where('email', $row['user_email'])->first();
            $items = $row['items'] ?? [];

            $order = Order::firstOrCreate(
                ['order_number' => $row['order_number']],
                collect($row)->except('order_number', 'user_email', 'items', 'created_at', 'updated_at')->all() + [
                    'user_id' => $user?->id,
                ]
            );
            $this->applyTimestamps($order, $row);

            if ($order->items()->count() === 0) {
                foreach ($items as $item) {
                    $orderItem = $order->items()->create(
                        collect($item)->except('product_slug', 'created_at', 'updated_at')->all() + [
                            'product_id' => $this->productIds[$item['product_slug'] ?? ''] ?? null,
                        ]
                    );
                    $this->applyTimestamps($orderItem, $item);
                }
            }
        }
    }

    private function applyTimestamps($model, array $row): void
    {
        if (! $model->wasRecentlyCreated) {
            return;
        }

        $model->timestamps = false;
        $model->forceFill([
            'created_at' => $row['created_at'] ?? now(),
            'updated_at' => $row['updated_at'] ?? now(),
        ])->save();
    }

    private function restoreImageFiles(array $rows): void
    {
        $targetDir = storage_path('app/public/products');
        $fixtureDir = database_path('fixtures/products');

        if (! is_dir($fixtureDir)) {
            return;
        }

        $referenced = [];
        foreach ($rows as $row) {
            foreach ($row['images'] ?? [] as $img) {
                $referenced[basename($img['image_path'])] = $img['image_path'];
            }
        }

        foreach ($referenced as $filename => $publicPath) {
            $target = $targetDir . '/' . $filename;
            $fixture = $fixtureDir . '/' . $filename;

            if (file_exists($target) || ! file_exists($fixture)) {
                continue;
            }

            File::ensureDirectoryExists($targetDir);
            File::copy($fixture, $target);
        }
    }
}