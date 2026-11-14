<?php

namespace App\Http\Controllers\Api;

use App\Models\PageVisit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VisitController
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'path' => ['required', 'string', 'max:2048'],
        ]);

        $path = parse_url($validated['path'], PHP_URL_PATH);

        if (! is_string($path) || $path === '') {
            return response()->json([
                'success' => false,
                'message' => 'La ruta de la visita no es válida.',
            ], 422);
        }

        $path = Str::start($path, '/');
        $path = Str::substr($path, 0, 255);

        $visitorHash = hash('sha256', implode('|', [
            'page-visit',
            (string) config('app.key'),
            (string) $request->ip(),
            (string) $request->userAgent(),
        ]));

        PageVisit::create([
            'path' => $path,
            'visitor_hash' => $visitorHash,
            'visited_at' => now(),
        ]);

        return response()->json(['success' => true], 201);
    }
}
