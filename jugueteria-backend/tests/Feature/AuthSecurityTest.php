<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_rejects_weak_passwords(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Cliente Prueba',
            'email' => 'cliente@example.com',
            'password' => 'password1',
            'password_confirmation' => 'password1',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        $this->assertDatabaseMissing('users', ['email' => 'cliente@example.com']);
    }

    public function test_registration_normalizes_email_and_returns_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Cliente Prueba',
            'email' => '  Cliente@Example.COM  ',
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
        ])->assertCreated();

        $response->assertJsonPath('data.user.email', 'cliente@example.com');
        $this->assertNotEmpty($response->json('data.token'));
        $this->assertDatabaseHas('users', ['email' => 'cliente@example.com']);
    }

    public function test_login_accepts_email_in_any_case(): void
    {
        User::factory()->create([
            'email' => 'cliente@example.com',
            'password' => Hash::make('SecurePass123'),
        ]);

        $this->postJson('/api/login', [
            'email' => 'CLIENTE@EXAMPLE.COM',
            'password' => 'SecurePass123',
        ])->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_login_uses_the_same_message_for_unknown_email_and_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'cliente@example.com',
            'password' => Hash::make('SecurePass123'),
        ]);

        $wrongPassword = $this->postJson('/api/login', [
            'email' => 'cliente@example.com',
            'password' => 'WrongPass123',
        ])->assertStatus(422);

        $unknownEmail = $this->postJson('/api/login', [
            'email' => 'desconocido@example.com',
            'password' => 'WrongPass123',
        ])->assertStatus(422);

        $this->assertSame(
            $wrongPassword->json('errors.email.0'),
            $unknownEmail->json('errors.email.0')
        );
    }

    public function test_login_is_locked_after_five_failed_attempts(): void
    {
        User::factory()->create([
            'email' => 'cliente@example.com',
            'password' => Hash::make('SecurePass123'),
        ]);

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->postJson('/api/login', [
                'email' => 'cliente@example.com',
                'password' => 'WrongPass123',
            ])->assertStatus(422);
        }

        $this->postJson('/api/login', [
            'email' => 'cliente@example.com',
            'password' => 'SecurePass123',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_password_change_revokes_other_sessions(): void
    {
        $user = User::factory()->create([
            'email' => 'cliente@example.com',
            'password' => Hash::make('OldPass123'),
        ]);

        $otherToken = $user->createToken('other-device');
        $currentToken = $user->createToken('current-device');

        $this->withToken($currentToken->plainTextToken)
            ->postJson('/api/profile/password', [
                'current_password' => 'OldPass123',
                'password' => 'NewPass123',
                'password_confirmation' => 'NewPass123',
            ])->assertOk();

        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $otherToken->accessToken->id,
        ]);
        $this->assertDatabaseHas('personal_access_tokens', [
            'id' => $currentToken->accessToken->id,
        ]);
    }

    public function test_password_reset_does_not_reveal_missing_accounts(): void
    {
        $this->postJson('/api/reset-password', [
            'token' => 'invalid-token',
            'email' => 'desconocido@example.com',
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
        ])->assertStatus(422)
            ->assertJsonPath(
                'errors.email.0',
                'El enlace de restablecimiento es inválido o ha expirado.'
            );
    }

    public function test_api_tokens_have_an_expiration_configured(): void
    {
        $this->assertGreaterThan(0, (int) config('sanctum.expiration'));
    }
}
