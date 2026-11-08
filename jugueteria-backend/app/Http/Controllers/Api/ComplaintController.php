<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreComplaintRequest;
use App\Models\Complaint;

class ComplaintController
{
    public function store(StoreComplaintRequest $request)
    {
        $complaint = Complaint::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Tu reclamo fue registrado correctamente.',
            'data' => [
                'code' => $complaint->code,
                'status' => $complaint->status,
                'status_label' => $complaint->status_label,
                'created_at' => $complaint->created_at?->toIso8601String(),
            ],
        ], 201);
    }
}
