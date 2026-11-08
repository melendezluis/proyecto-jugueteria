<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use RuntimeException;
use Tests\TestCase;

class AdminUserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_an_admin_from_config(): void
    {
        Config::set('admin.name', 'Admin Principal');
        Config::set('admin.email', 'admin@example.com');
        Config::set('admin.password', 'Secret12345');

        $this->seed(RolePermissionSeeder::class);
        $this->seed(AdminUserSeeder::class);

        $user = User::where('email', 'admin@example.com')->first();

        $this->assertNotNull($user);
        $this->assertSame('Admin Principal', $user->name);
        $this->assertTrue($user->hasRole('admin'));
        $this->assertTrue(Hash::check('Secret12345', $user->password));
    }

    public function test_skips_when_credentials_are_missing(): void
    {
        Config::set('admin.email', null);
        Config::set('admin.password', null);

        $this->seed(AdminUserSeeder::class);

        $this->assertDatabaseCount('users', 0);
    }

    public function test_rejects_a_short_password(): void
    {
        Config::set('admin.email', 'admin@example.com');
        Config::set('admin.password', 'short');

        $this->expectException(RuntimeException::class);

        $this->seed(AdminUserSeeder::class);
    }
}
