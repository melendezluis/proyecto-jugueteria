<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiar cache de permisos
        app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        // Crear permisos
        $permissions = [
            'product-list', 'product-create', 'product-edit', 'product-delete',
            'category-list', 'category-create', 'category-edit', 'category-delete',
            'brand-list', 'brand-create', 'brand-edit', 'brand-delete',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Crear roles y asignar permisos
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo($permissions);

        $editor = Role::create(['name' => 'editor']);
        $editor->givePermissionTo([
            'product-list', 'product-create', 'product-edit',
            'category-list', 'category-create', 'category-edit',
            'brand-list', 'brand-create', 'brand-edit',
        ]);

        $client = Role::create(['name' => 'client']);
        $client->givePermissionTo([
            'product-list',
            'category-list',
            'brand-list',
        ]);

        // Asignar rol admin al usuario test
        $user = User::where('email', 'test@example.com')->first();
        if ($user) {
            $user->assignRole('admin');
        }

        echo "✅ Roles y permisos creados exitosamente!\n";
    }
}
