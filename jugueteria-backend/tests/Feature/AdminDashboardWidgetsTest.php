<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminDashboardWidgetsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Category $category;

    private Brand $brand;

    private User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
        $this->admin->assignRole(Role::findOrCreate('admin'));

        $this->category = Category::create(['name' => 'Deportes']);
        $this->brand = Brand::create(['name' => 'Topsport']);

        $this->customer = User::factory()->create();

        $this->actingAs($this->admin);
    }

    private function product(string $name, int $stock): Product
    {
        return Product::create([
            'name' => $name,
            'slug' => Str::slug($name),
            'price' => 30,
            'stock' => $stock,
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
        ]);
    }

    private function order(float $total, string $status): Order
    {
        return Order::create([
            'user_id' => $this->customer->id,
            'subtotal' => $total,
            'shipping' => 0,
            'total' => $total,
            'status' => $status,
            'shipping_fullname' => 'Juan Perez',
            'shipping_address' => 'Av. Lima 123',
            'shipping_city' => 'Lima',
        ]);
    }

    public function test_dashboard_renders_all_widgets(): void
    {
        $this->product('Pelota Gigante', 50);
        $this->product('Auto de Carrera', 2);
        $this->order(150, 'paid');

        $this->get(route('filament.admin.pages.dashboard'))
            ->assertOk()
            ->assertSee('Pedidos')
            ->assertSee('Ventas')
            ->assertSee('Productos activos')
            ->assertSee('Stock bajo')
            ->assertSee('Ventas por día (últimos 14 días)')
            ->assertSee('Últimos pedidos')
            ->assertSee('Productos con stock bajo');
    }

    public function test_stats_show_totals_for_paid_orders_and_low_stock(): void
    {
        $this->product('Pelota Gigante', 50);
        $this->product('Auto de Carrera', 2);
        $this->product('Muñeca Rota', 0);
        $this->order(150, 'paid');
        $this->order(40, 'pending');

        $this->get(route('filament.admin.pages.dashboard'))
            ->assertOk()
            ->assertSee('S/ 150.00')
            ->assertSee('Auto de Carrera')
            ->assertSee('Muñeca Rota')
            ->assertDontSee('Pelota Gigante');
    }

    public function test_recent_orders_widget_shows_order_number_and_status_in_spanish(): void
    {
        $paid = $this->order(150, 'paid');
        $this->order(40, 'pending');

        $this->get(route('filament.admin.pages.dashboard'))
            ->assertOk()
            ->assertSee($paid->order_number)
            ->assertSee('Pagado')
            ->assertSee('Pendiente')
            ->assertSee('S/ 150.00');
    }
}
