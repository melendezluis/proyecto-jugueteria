<?php

namespace Tests\Feature;

use App\Filament\Resources\Products\Pages\ManageProducts;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Testing\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use PHPUnit\Framework\Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminProductImageTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Category $category;

    private Brand $brand;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->admin = User::factory()->create();
        $this->admin->assignRole(Role::findOrCreate('admin'));

        $this->category = Category::create(['name' => 'Figuras de Acción']);
        $this->brand = Brand::create(['name' => 'LEGO']);

        $this->actingAs($this->admin);
    }

    private function png(): File
    {
        return UploadedFile::fake()->createWithContent(
            'photo.png',
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
        );
    }

    private function makeProduct(string $name, string $imagePath): Product
    {
        Storage::disk('public')->put(str_replace('/storage/', '', $imagePath), 'x');

        $product = Product::create([
            'name' => $name,
            'price' => 30,
            'stock' => 5,
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
        ]);

        ProductImage::create([
            'product_id' => $product->id,
            'image_path' => $imagePath,
            'position' => 1,
            'is_main' => true,
        ]);

        return $product;
    }

    private function rawImagePaths(array $state): array
    {
        $paths = [];

        foreach (data_get($state, 'images', []) as $item) {
            $value = data_get($item, 'image_path');

            foreach (is_array($value) ? array_values($value) : [$value] as $path) {
                if (is_string($path) && $path !== '') {
                    $paths[] = $path;
                }
            }
        }

        return $paths;
    }

    public function test_products_index_renders_with_image_preview(): void
    {
        $this->makeProduct('Robot Gigante', '/storage/products/robot.png');

        $this->get(route('filament.admin.resources.products.index'))
            ->assertOk()
            ->assertSee('Robot Gigante');
    }

    public function test_admin_can_create_product_with_uploaded_image(): void
    {
        Livewire::test(ManageProducts::class)
            ->callAction('create', [
                'name' => 'Carro de Juguete',
                'slug' => 'carro-de-juguete',
                'category_id' => $this->category->id,
                'brand_id' => $this->brand->id,
                'price' => 50,
                'stock' => 10,
                'images' => [
                    ['image_path' => [$this->png()], 'is_main' => true],
                ],
            ]);

        $product = Product::where('slug', 'carro-de-juguete')->firstOrFail();
        $image = $product->images()->firstOrFail();

        $this->assertStringStartsWith('/storage/products/', $image->image_path);
        $this->assertTrue((bool) $image->is_main);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $image->image_path));
    }

    public function test_edit_form_loads_existing_image_relative_to_disk(): void
    {
        $product = $this->makeProduct('Pelota', '/storage/products/pelota.png');

        Livewire::test(ManageProducts::class)
            ->mountTableAction('edit', $product)
            ->assertSchemaStateSet(function (array $state): array {
                Assert::assertSame(['products/pelota.png'], $this->rawImagePaths($state));

                return [];
            });
    }

    public function test_editing_product_keeps_existing_image_path_unchanged(): void
    {
        $product = $this->makeProduct('Pelota', '/storage/products/pelota.png');

        Livewire::test(ManageProducts::class)
            ->callTableAction('edit', $product, [
                'price' => 45,
            ]);

        $this->assertSame(
            '/storage/products/pelota.png',
            $product->images()->firstOrFail()->image_path
        );
        Storage::disk('public')->assertExists('products/pelota.png');
    }

    public function test_replacing_the_image_on_the_same_record_deletes_the_previous_file(): void
    {
        $product = $this->makeProduct('Pelota', '/storage/products/pelota.png');
        $key = 'record-'.$product->images()->first()->id;

        Livewire::test(ManageProducts::class)
            ->mountTableAction('edit', $product)
            ->fillForm(['images' => [$key => ['image_path' => []]]])
            ->fillForm(['images' => [$key => ['image_path' => [$this->png()], 'is_main' => true]]])
            ->callMountedAction();

        $image = $product->images()->firstOrFail();

        $this->assertSame(1, $product->images()->count());
        $this->assertNotSame('/storage/products/pelota.png', $image->image_path);
        $this->assertStringStartsWith('/storage/products/', $image->image_path);
        Storage::disk('public')->assertMissing('products/pelota.png');
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $image->image_path));
    }

    public function test_removing_the_image_and_adding_a_new_one_deletes_the_previous_file(): void
    {
        $product = $this->makeProduct('Pelota', '/storage/products/pelota.png');

        Livewire::test(ManageProducts::class)
            ->mountTableAction('edit', $product)
            ->fillForm(['images' => []])
            ->fillForm([
                'images' => [
                    ['image_path' => [$this->png()], 'is_main' => true],
                ],
            ])
            ->callMountedAction();

        $image = $product->images()->firstOrFail();

        $this->assertSame(1, $product->images()->count());
        $this->assertStringStartsWith('/storage/products/', $image->image_path);
        Storage::disk('public')->assertMissing('products/pelota.png');
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $image->image_path));
    }

    public function test_changing_the_path_on_an_image_record_deletes_the_previous_file(): void
    {
        $product = $this->makeProduct('Pelota', '/storage/products/pelota.png');
        Storage::disk('public')->put('products/nueva.png', 'x');

        $product->images()->firstOrFail()->update(['image_path' => '/storage/products/nueva.png']);

        Storage::disk('public')->assertMissing('products/pelota.png');
        Storage::disk('public')->assertExists('products/nueva.png');
    }

    public function test_deleting_a_product_through_the_table_action_deletes_its_image_files(): void
    {
        $product = $this->makeProduct('Pelota', '/storage/products/pelota.png');

        Livewire::test(ManageProducts::class)
            ->callTableAction('delete', $product);

        $this->assertDatabaseMissing('product_images', ['product_id' => $product->id]);
        Storage::disk('public')->assertMissing('products/pelota.png');
    }

    public function test_image_files_used_by_order_items_are_kept(): void
    {
        $product = $this->makeProduct('Pelota', '/storage/products/pelota.png');

        $order = Order::create([
            'order_number' => 'ELGATO-TEST0001',
            'user_id' => $this->admin->id,
            'subtotal' => 30,
            'shipping' => 0,
            'total' => 30,
            'status' => 'paid',
            'shipping_fullname' => 'Cliente Demo',
            'shipping_address' => 'Av. Siempreviva 742',
            'shipping_city' => 'Lima',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => 'Pelota',
            'product_image' => '/storage/products/pelota.png',
            'unit_price' => 30,
            'quantity' => 1,
            'total' => 30,
        ]);

        $product->delete();

        $this->assertDatabaseMissing('product_images', ['product_id' => $product->id]);
        Storage::disk('public')->assertExists('products/pelota.png');
    }

    public function test_create_requires_at_least_one_image(): void
    {
        Livewire::test(ManageProducts::class)
            ->mountAction('create')
            ->fillForm([
                'name' => 'Sin Imagen',
                'slug' => 'sin-imagen',
                'category_id' => $this->category->id,
                'brand_id' => $this->brand->id,
                'price' => 10,
                'stock' => 1,
            ])
            ->callMountedAction()
            ->assertHasFormErrors(['images']);

        $this->assertDatabaseMissing('products', ['slug' => 'sin-imagen']);
    }

    public function test_success_notification_renders_in_panel_layout(): void
    {
        Livewire::test(ManageProducts::class)
            ->callAction('create', [
                'name' => 'Carro de Juguete',
                'slug' => 'carro-de-juguete',
                'category_id' => $this->category->id,
                'brand_id' => $this->brand->id,
                'price' => 50,
                'stock' => 10,
                'images' => [
                    ['image_path' => [$this->png()], 'is_main' => true],
                ],
            ]);

        $this->get(route('filament.admin.resources.products.index'))
            ->assertOk()
            ->assertSee('fi-no-notification-title', false)
            ->assertSee('Carro de Juguete');
    }
}
