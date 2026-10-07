<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\User;
use App\Support\PublicStorage;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiCategoryBrandImageTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
        Sanctum::actingAs($this->admin);
    }

    private function png(string $name = 'photo.png'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent(
            $name,
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
        );
    }

    public function test_create_category_with_uploaded_image(): void
    {
        $response = $this->post('/api/categories', [
            'name' => 'Deportes',
            'image' => $this->png('deportes.png'),
        ], ['Accept' => 'application/json']);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true);

        $category = Category::firstOrFail();

        $this->assertStringStartsWith('/storage/categories/', $category->image);
        Storage::disk('public')->assertExists(PublicStorage::relativePath($category->image));
    }

    public function test_update_category_with_new_image_deletes_the_previous_file(): void
    {
        $category = Category::create([
            'name' => 'Deportes',
            'image' => PublicStorage::store($this->png('vieja.png'), 'categories'),
        ]);

        $oldPath = $category->image;

        $this->put('/api/categories/'.$category->id, [
            'image' => $this->png('nueva.png'),
        ], ['Accept' => 'application/json'])->assertOk();

        $category->refresh();

        $this->assertNotSame($oldPath, $category->image);
        Storage::disk('public')->assertMissing(PublicStorage::relativePath($oldPath));
        Storage::disk('public')->assertExists(PublicStorage::relativePath($category->image));
    }

    public function test_update_category_without_image_keeps_the_current_file(): void
    {
        $category = Category::create([
            'name' => 'Deportes',
            'image' => PublicStorage::store($this->png('actual.png'), 'categories'),
        ]);

        $path = $category->image;

        $this->put('/api/categories/'.$category->id, [
            'description' => 'Juguetes deportivos',
        ], ['Accept' => 'application/json'])->assertOk();

        $category->refresh();

        $this->assertSame($path, $category->image);
        Storage::disk('public')->assertExists(PublicStorage::relativePath($path));
    }

    public function test_update_category_normalizes_string_paths(): void
    {
        $category = Category::create(['name' => 'Deportes']);

        $this->put('/api/categories/'.$category->id, [
            'image' => 'categories/legacy.png',
        ], ['Accept' => 'application/json'])->assertOk();

        $this->assertSame('/storage/categories/legacy.png', $category->fresh()->image);
    }

    public function test_deleting_category_removes_its_image_file(): void
    {
        $category = Category::create([
            'name' => 'Deportes',
            'image' => PublicStorage::store($this->png('borrar.png'), 'categories'),
        ]);

        $relative = PublicStorage::relativePath($category->image);
        Storage::disk('public')->assertExists($relative);

        $this->delete('/api/categories/'.$category->id, [], ['Accept' => 'application/json'])
            ->assertOk();

        Storage::disk('public')->assertMissing($relative);
        $this->assertNull(Category::find($category->id));
    }

    public function test_create_brand_with_uploaded_logo(): void
    {
        $response = $this->post('/api/brands', [
            'name' => 'Topsport',
            'logo' => $this->png('logo.png'),
        ], ['Accept' => 'application/json']);

        $response->assertCreated();

        $brand = Brand::firstOrFail();

        $this->assertStringStartsWith('/storage/brands/', $brand->logo);
        Storage::disk('public')->assertExists(PublicStorage::relativePath($brand->logo));
    }

    public function test_update_brand_with_new_logo_deletes_the_previous_file(): void
    {
        $brand = Brand::create([
            'name' => 'Topsport',
            'logo' => PublicStorage::store($this->png('viejo.png'), 'brands'),
        ]);

        $oldPath = $brand->logo;

        $this->put('/api/brands/'.$brand->id, [
            'logo' => $this->png('nuevo.png'),
        ], ['Accept' => 'application/json'])->assertOk();

        $brand->refresh();

        $this->assertNotSame($oldPath, $brand->logo);
        Storage::disk('public')->assertMissing(PublicStorage::relativePath($oldPath));
        Storage::disk('public')->assertExists(PublicStorage::relativePath($brand->logo));
    }

    public function test_invalid_image_upload_returns_spanish_validation_error(): void
    {
        $response = $this->post('/api/categories', [
            'name' => 'Deportes',
            'image' => UploadedFile::fake()->create('notas.txt', 10, 'text/plain'),
        ], ['Accept' => 'application/json']);

        $response->assertStatus(422);

        $errors = $response->json('errors');
        $key = array_key_first($errors);

        $this->assertSame('image', $key);
        $this->assertStringContainsString('imagen', $errors['image'][0]);
    }

    public function test_client_role_cannot_create_categories(): void
    {
        $client = User::factory()->create();
        $client->assignRole('client');
        Sanctum::actingAs($client);

        $this->post('/api/categories', ['name' => 'Nuevo'], ['Accept' => 'application/json'])
            ->assertForbidden();
    }
}
