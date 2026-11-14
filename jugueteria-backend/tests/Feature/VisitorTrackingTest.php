<?php

namespace Tests\Feature;

use App\Models\PageVisit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VisitorTrackingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_record_an_anonymous_page_visit(): void
    {
        $response = $this->withHeader('User-Agent', 'Test Browser')
            ->postJson('/api/visits', ['path' => '/productos?ref=home']);

        $response->assertCreated()->assertJson(['success' => true]);

        $visit = PageVisit::firstOrFail();

        $this->assertSame('/productos', $visit->path);
        $this->assertSame(64, strlen($visit->visitor_hash));
        $this->assertNotSame('127.0.0.1', $visit->visitor_hash);
    }

    public function test_visitors_are_distinguished_by_browser(): void
    {
        $this->withHeader('User-Agent', 'Browser A')
            ->postJson('/api/visits', ['path' => '/'])
            ->assertCreated();

        $this->withHeader('User-Agent', 'Browser B')
            ->postJson('/api/visits', ['path' => '/'])
            ->assertCreated();

        $this->assertSame(2, PageVisit::count());
        $this->assertSame(2, PageVisit::distinct()->count('visitor_hash'));
    }

    public function test_visit_path_is_required(): void
    {
        $this->postJson('/api/visits', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('path');
    }

    public function test_admin_dashboard_shows_visitor_counters(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(Role::findOrCreate('admin'));

        $visitorA = hash('sha256', 'visitor-a');
        $visitorB = hash('sha256', 'visitor-b');
        $visitorC = hash('sha256', 'visitor-c');

        foreach ([
            ['/productos', $visitorA, now()->subMinutes(3)],
            ['/productos/lego', $visitorA, now()->subMinutes(2)],
            ['/contacto', $visitorB, now()->subMinute()],
            ['/nosotros', $visitorC, now()->subDays(8)],
        ] as [$path, $visitorHash, $visitedAt]) {
            PageVisit::create([
                'path' => $path,
                'visitor_hash' => $visitorHash,
                'visited_at' => $visitedAt,
            ]);
        }

        $this->actingAs($admin)
            ->get(route('filament.admin.pages.dashboard'))
            ->assertOk()
            ->assertSee('Visitas hoy')
            ->assertSee('Visitantes únicos hoy')
            ->assertSee('4 visitas en total')
            ->assertSee('3 en total')
            ->assertSee('2 visitantes únicos')
            ->assertSee('En línea ahora');
    }
}
