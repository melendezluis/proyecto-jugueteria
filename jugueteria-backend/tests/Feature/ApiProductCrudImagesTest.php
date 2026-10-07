<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Support\PublicStorage;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiProductCrudImagesTest extends TestCase
{
    use RefreshDatabase;

    private Category $category;

    private Brand $brand;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        $this->seed(RolePermissionSeeder::class);

        $this->category = Category::create(['name' => 'Deportes']);
        $this->brand = Brand::create(['name' => 'Topsport']);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    private function asAdmin(): void
    {
        Sanctum::actingAs($this->admin);
    }

    private function png(string $name = 'photo.png'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent(
            $name,
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
        );
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Pelota Gigante',
            'price' => 50,
            'stock' => 10,
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
        ], $overrides);
    }

    private function postProduct(array $data)
    {
        return $this->post('/api/products', $data, ['Accept' => 'application/json']);
    }

    private function putProduct(int $id, array $data)
    {
        return $this->put('/api/products/'.$id, $data, ['Accept' => 'application/json']);
    }

    public function test_create_product_stores_uploaded_images_and_variants(): void
    {
        $this->asAdmin();

        $response = $this->postProduct($this->payload([
            'images' => [$this->png('uno.png'), $this->png('dos.png')],
            'image_alts' => ['Vista uno', 'Vista dos'],
            'variants' => [
                ['size' => 'S', 'stock' => 3],
                ['size' => 'L', 'stock' => 5, 'price_extra' => 10],
            ],
        ]));

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data.images')
            ->assertJsonCount(2, 'data.variants')
            ->assertJsonPath('data.images.0.is_main', true)
            ->assertJsonPath('data.images.0.position', 1)
            ->assertJsonPath('data.images.1.is_main', false);

        $product = Product::firstOrFail();

        $this->assertCount(2, $product->images);
        $this->assertCount(2, $product->variants);

        $image = $product->images->first();
        $this->assertStringStartsWith('/storage/products/', $image->image_path);
        $this->assertSame('Vista uno', $image->alt_text);
        Storage::disk('public')->assertExists(PublicStorage::relativePath($image->image_path));

        $variant = $product->variants->first();
        $this->assertSame('S', $variant->size);
        $this->assertSame(3, (int) $variant->stock);
    }

    public function test_update_without_images_or_variants_keeps_them(): void
    {
        $this->asAdmin();

        $this->postProduct($this->payload([
            'images' => [$this->png('original.png')],
            'variants' => [['size' => 'S', 'stock' => 3]],
        ]))->assertCreated();

        $product = Product::firstOrFail();
        $path = $product->images->first()->image_path;

        $response = $this->putProduct($product->id, ['price' => 75])
            ->assertOk()
            ->assertJsonCount(1, 'data.images')
            ->assertJsonCount(1, 'data.variants');

        $this->assertSame(75.0, (float) $response->json('data.price'));

        $product->refresh();

        $this->assertSame($path, $product->images->first()->image_path);
        $this->assertSame(75.0, (float) $product->price);
        Storage::disk('public')->assertExists(PublicStorage::relativePath($path));
    }

    public function test_update_with_new_image_replaces_and_deletes_previous_file(): void
    {
        $this->asAdmin();

        $this->postProduct($this->payload([
            'images' => [$this->png('vieja.png')],
        ]))->assertCreated();

        $product = Product::firstOrFail();
        $oldPath = $product->images->first()->image_path;

        $this->putProduct($product->id, [
            'images' => [$this->png('nueva.png')],
        ])
            ->assertOk()
            ->assertJsonCount(1, 'data.images')
            ->assertJsonPath('data.images.0.is_main', true);

        $product->refresh();
        $newPath = $product->images->first()->image_path;

        $this->assertNotSame($oldPath, $newPath);
        Storage::disk('public')->assertMissing(PublicStorage::relativePath($oldPath));
        Storage::disk('public')->assertExists(PublicStorage::relativePath($newPath));
    }

    public function test_update_with_variants_replaces_the_full_list(): void
    {
        $this->asAdmin();

        $this->postProduct($this->payload([
            'variants' => [
                ['size' => 'S', 'stock' => 3],
                ['size' => 'L', 'stock' => 5],
            ],
        ]))->assertCreated();

        $product = Product::firstOrFail();

        $this->putProduct($product->id, [
            'variants' => [['size' => 'XL', 'stock' => 2]],
        ])
            ->assertOk()
            ->assertJsonCount(1, 'data.variants')
            ->assertJsonPath('data.variants.0.size', 'XL');

        $product->refresh();

        $this->assertCount(1, $product->variants);
        $this->assertSame('XL', $product->variants->first()->size);
    }

    public function test_validation_error_messages_are_in_spanish(): void
    {
        $this->asAdmin();

        $response = $this->postProduct([
            'price' => 50,
            'stock' => 10,
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('errors.name.0', 'El nombre del producto es obligatorio.');
    }

    public function test_non_image_file_is_rejected_in_spanish(): void
    {
        $this->asAdmin();

        $response = $this->postProduct($this->payload([
            'images' => [UploadedFile::fake()->create('notas.txt', 10, 'text/plain')],
        ]));

        $response->assertStatus(422);

        $errors = $response->json('errors');
        $key = array_key_first($errors);

        $this->assertStringStartsWith('images', (string) $key);
        $this->assertStringContainsString('imagen', $errors[$key][0]);
    }

    public function test_guest_cannot_create_products(): void
    {
        $this->postProduct($this->payload())->assertUnauthorized();
    }

    public function test_client_role_cannot_create_products(): void
    {
        $client = User::factory()->create();
        $client->assignRole('client');
        Sanctum::actingAs($client);

        $this->postProduct($this->payload())->assertForbidden();
    }
}
