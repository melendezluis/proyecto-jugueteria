<?php

namespace Tests\Feature;

use App\Filament\Resources\Products\Pages\ManageProducts;
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

class AdminLocaleTest extends TestCase
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

    public function test_panel_locale_is_spanish(): void
    {
        $this->get(route('filament.admin.pages.dashboard'))
            ->assertOk()
            ->assertSee('Escritorio')
            ->assertSee('Productos')
            ->assertSee('Marcas')
            ->assertSee('Categorías')
            ->assertSee('Órdenes');
    }

    public function test_validation_messages_are_in_spanish(): void
    {
        Livewire::test(ManageProducts::class)
            ->mountAction('create')
            ->fillForm([
                'slug' => 'sin-nombre',
                'category_id' => $this->category->id,
                'brand_id' => $this->brand->id,
                'price' => 10,
                'stock' => 1,
                'images' => [
                    ['image_path' => [$this->png()], 'is_main' => true],
                ],
            ])
            ->callMountedAction()
            ->assertHasFormErrors(['name']);

        $this->assertSame('El campo nombre es obligatorio.', __('validation.required', ['attribute' => 'nombre']));
    }

    public function test_create_notification_title_is_in_spanish(): void
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
            ->assertSee('Creado');
    }
}
