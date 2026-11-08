<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = trim((string) config('admin.email'));
        $password = (string) config('admin.password');
        $name = trim((string) config('admin.name', 'Administrador'));

        if ($email === '' || $password === '') {
            $this->command?->warn('Define ADMIN_EMAIL y ADMIN_PASSWORD para crear el administrador.');

            return;
        }

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('ADMIN_EMAIL no es un correo válido.');
        }

        if (mb_strlen($password) < 10) {
            throw new RuntimeException('ADMIN_PASSWORD debe tener al menos 10 caracteres.');
        }

        Role::findOrCreate('admin');

        $user = User::firstOrCreate(
            ['email' => $email],
            ['name' => $name !== '' ? $name : 'Administrador', 'password' => $password]
        );

        $user->assignRole('admin');

        $this->command?->info("Administrador listo: {$email}");
    }
}
