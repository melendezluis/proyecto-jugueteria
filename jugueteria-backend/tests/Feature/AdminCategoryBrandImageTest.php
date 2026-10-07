<?php

namespace Tests\Feature;

use App\Filament\Resources\Brands\Pages\ManageBrands;
use App\Filament\Resources\Categories\Pages\ManageCategories;
use App\Models\Brand;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Testing\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminCategoryBrandImageTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->admin = User::factory()->create();
        $this->admin->assignRole(Role::findOrCreate('admin'));

        $this->actingAs($this->admin);
    }

    private function png(): File
    {
        return UploadedFile::fake()->createWithContent(
            'photo.png',
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
        );
    }

    private function makeCategory(string $imagePath): Category
    {
        Storage::disk('public')->put(str_replace('/storage/', '', $imagePath), 'x');

        return Category::create([
            'name' => 'Figuras de Acción',
            'image' => $imagePath,
        ]);
    }

    private function makeBrand(string $logoPath): Brand
    {
        Storage::disk('public')->put(str_replace('/storage/', '', $logoPath), 'x');

        return Brand::create([
            'name' => 'LEGO',
            'logo' => $logoPath,
        ]);
    }

    public function test_create_category_with_uploaded_image(): void
    {
        Livewire::test(ManageCategories::class)
            ->callAction('create', [
                'name' => 'Peluches',
                'image' => [$this->png()],
            ]);

        $category = Category::where('slug', 'peluches')->firstOrFail();

        $this->assertStringStartsWith('/storage/categories/', $category->image);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $category->image));
    }

    public function test_editing_category_without_touching_image_keeps_the_file(): void
    {
        $category = $this->makeCategory('/storage/categories/peluches.png');

        Livewire::test(ManageCategories::class)
            ->callTableAction('edit', $category, [
                'description' => 'Peluches suaves',
            ]);

        $this->assertSame('/storage/categories/peluches.png', $category->fresh()->image);
        Storage::disk('public')->assertExists('categories/peluches.png');
    }

    public function test_replacing_the_category_image_deletes_the_previous_file(): void
    {
        $category = $this->makeCategory('/storage/categories/peluches.png');

        Livewire::test(ManageCategories::class)
            ->mountTableAction('edit', $category)
            ->fillForm(['image' => []])
            ->fillForm(['image' => [$this->png()]])
            ->callMountedAction();

        $image = $category->fresh()->image;

        $this->assertNotSame('/storage/categories/peluches.png', $image);
        $this->assertStringStartsWith('/storage/categories/', $image);
        Storage::disk('public')->assertMissing('categories/peluches.png');
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $image));
    }

    public function test_removing_the_category_image_deletes_the_file(): void
    {
        $category = $this->makeCategory('/storage/categories/peluches.png');

        Livewire::test(ManageCategories::class)
            ->mountTableAction('edit', $category)
            ->fillForm(['image' => []])
            ->callMountedAction();

        $this->assertNull($category->fresh()->image);
        Storage::disk('public')->assertMissing('categories/peluches.png');
    }

    public function test_deleting_a_category_deletes_its_image_file(): void
    {
        $category = $this->makeCategory('/storage/categories/peluches.png');

        Livewire::test(ManageCategories::class)
            ->callTableAction('delete', $category);

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
        Storage::disk('public')->assertMissing('categories/peluches.png');
    }

    public function test_category_index_renders_the_image_preview(): void
    {
        $this->makeCategory('/storage/categories/peluches.png');

        $this->get(route('filament.admin.resources.categories.index'))
            ->assertOk()
            ->assertSee('storage/categories/peluches.png', false);
    }

    public function test_category_with_external_url_is_kept_and_never_deleted_from_disk(): void
    {
        $category = Category::create([
            'name' => 'Externa',
            'image' => 'https://cdn.example.com/categoria.png',
        ]);

        $category->delete();

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_create_brand_with_uploaded_logo(): void
    {
        Livewire::test(ManageBrands::class)
            ->callAction('create', [
                'name' => 'Playmobil',
                'logo' => [$this->png()],
            ]);

        $brand = Brand::where('slug', 'playmobil')->firstOrFail();

        $this->assertStringStartsWith('/storage/brands/', $brand->logo);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $brand->logo));
    }

    public function test_replacing_the_brand_logo_deletes_the_previous_file(): void
    {
        $brand = $this->makeBrand('/storage/brands/lego.png');

        Livewire::test(ManageBrands::class)
            ->mountTableAction('edit', $brand)
            ->fillForm(['logo' => []])
            ->fillForm(['logo' => [$this->png()]])
            ->callMountedAction();

        $logo = $brand->fresh()->logo;

        $this->assertNotSame('/storage/brands/lego.png', $logo);
        $this->assertStringStartsWith('/storage/brands/', $logo);
        Storage::disk('public')->assertMissing('brands/lego.png');
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $logo));
    }

    public function test_deleting_a_brand_deletes_its_logo_file(): void
    {
        $brand = $this->makeBrand('/storage/brands/lego.png');

        Livewire::test(ManageBrands::class)
            ->callTableAction('delete', $brand);

        $this->assertDatabaseMissing('brands', ['id' => $brand->id]);
        Storage::disk('public')->assertMissing('brands/lego.png');
    }

    public function test_brand_index_renders_the_logo_preview(): void
    {
        $this->makeBrand('/storage/brands/lego.png');

        $this->get(route('filament.admin.resources.brands.index'))
            ->assertOk()
            ->assertSee('storage/brands/lego.png', false);
    }
}
