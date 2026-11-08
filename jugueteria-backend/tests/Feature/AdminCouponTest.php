<?php

namespace Tests\Feature;

use App\Filament\Resources\Coupons\Pages\CreateCoupon;
use App\Filament\Resources\Coupons\Pages\EditCoupon;
use App\Models\Coupon;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminCouponTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
        $this->admin->assignRole(Role::findOrCreate('admin'));

        $this->actingAs($this->admin);
    }

    public function test_admin_can_list_coupons(): void
    {
        Coupon::create([
            'code' => 'VERANO10',
            'type' => Coupon::TYPE_PERCENTAGE,
            'value' => 10,
        ]);

        $this->get(route('filament.admin.resources.coupons.index'))
            ->assertOk()
            ->assertSee('VERANO10')
            ->assertSee('10%');
    }

    public function test_admin_can_create_coupon(): void
    {
        Livewire::test(CreateCoupon::class)
            ->fillForm([
                'code' => 'promo20',
                'type' => Coupon::TYPE_PERCENTAGE,
                'value' => 20,
                'min_subtotal' => 50,
                'usage_limit' => 100,
                'usage_limit_per_user' => 1,
                'is_active' => true,
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $this->assertDatabaseHas('coupons', [
            'code' => 'PROMO20',
            'type' => Coupon::TYPE_PERCENTAGE,
            'value' => 20,
        ]);
    }

    public function test_admin_can_view_coupon_redemptions(): void
    {
        $coupon = Coupon::create([
            'code' => 'VERANO10',
            'type' => Coupon::TYPE_PERCENTAGE,
            'value' => 10,
        ]);

        $this->get(route('filament.admin.resources.coupons.edit', $coupon))
            ->assertOk()
            ->assertSee('VERANO10');
    }
}
