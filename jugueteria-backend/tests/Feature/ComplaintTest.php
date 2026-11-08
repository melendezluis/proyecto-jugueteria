<?php

namespace Tests\Feature;

use App\Filament\Resources\Complaints\Pages\EditComplaint;
use App\Models\Complaint;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ComplaintTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'full_name' => 'Ana Pérez',
            'document_type' => 'DNI',
            'document_number' => '12345678',
            'email' => 'ANA@EXAMPLE.COM',
            'phone' => '928 049 345',
            'address' => 'Av. Buenos Aires 1209',
            'order_number' => 'ELGATO-ABCD1234',
            'type' => 'reclamo',
            'product_service' => 'Peluche mediano',
            'amount' => 49.90,
            'detail' => 'El producto llegó con una costura abierta y no se puede usar.',
            'request' => 'Solicito el cambio del producto o la devolución del importe.',
            'accepted' => true,
        ], $overrides);
    }

    public function test_public_user_can_register_a_complaint(): void
    {
        $response = $this->postJson('/api/complaints', $this->validPayload());

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending');

        $code = $response->json('data.code');

        $this->assertMatchesRegularExpression('/^LR-\d{8}-[A-Z0-9]{6}$/', $code);

        $this->assertDatabaseHas('complaints', [
            'code' => $code,
            'full_name' => 'Ana Pérez',
            'email' => 'ana@example.com',
            'phone' => '928049345',
            'type' => 'reclamo',
            'status' => 'pending',
        ]);
    }

    public function test_complaint_requires_terms_acceptance(): void
    {
        $response = $this->postJson('/api/complaints', $this->validPayload([
            'accepted' => false,
        ]));

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('accepted');

        $this->assertDatabaseCount('complaints', 0);
    }

    public function test_complaint_rejects_invalid_type_and_short_detail(): void
    {
        $response = $this->postJson('/api/complaints', $this->validPayload([
            'type' => 'otro',
            'detail' => 'Corto',
        ]));

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['type', 'detail']);
    }

    public function test_response_sets_responded_at_automatically(): void
    {
        $complaint = Complaint::create([
            'full_name' => 'Carlos Ruiz',
            'document_type' => 'DNI',
            'document_number' => '87654321',
            'email' => 'carlos@example.com',
            'type' => 'queja',
            'product_service' => 'Atención en tienda',
            'detail' => 'La atención recibida no fue la esperada.',
            'request' => 'Solicito una disculpa y una explicación.',
            'status' => 'pending',
        ]);

        $this->assertNull($complaint->responded_at);

        $complaint->update([
            'status' => 'resolved',
            'response' => 'Se contactó al cliente y se atendió su solicitud.',
        ]);

        $this->assertNotNull($complaint->fresh()->responded_at);
    }

    public function test_admin_can_view_and_answer_a_complaint(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(Role::findOrCreate('admin'));

        $complaint = Complaint::create([
            'full_name' => 'Lucía Torres',
            'document_type' => 'DNI',
            'document_number' => '11223344',
            'email' => 'lucia@example.com',
            'type' => 'reclamo',
            'product_service' => 'Juego de bloques',
            'detail' => 'Faltan piezas en el producto recibido.',
            'request' => 'Solicito el cambio por un producto completo.',
        ]);

        $this->actingAs($admin)
            ->get(route('filament.admin.resources.complaints.index'))
            ->assertOk()
            ->assertSee($complaint->code);

        Livewire::test(EditComplaint::class, ['record' => $complaint->getRouteKey()])
            ->fillForm([
                'status' => 'resolved',
                'response' => 'Se coordinó el cambio del producto con el cliente.',
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertDatabaseHas('complaints', [
            'id' => $complaint->id,
            'status' => 'resolved',
            'response' => 'Se coordinó el cambio del producto con el cliente.',
        ]);

        $this->assertNotNull($complaint->fresh()->responded_at);
    }
}
