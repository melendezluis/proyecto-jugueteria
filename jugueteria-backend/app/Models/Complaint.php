<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'full_name',
        'document_type',
        'document_number',
        'email',
        'phone',
        'address',
        'order_number',
        'type',
        'product_service',
        'amount',
        'detail',
        'request',
        'status',
        'response',
        'responded_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'responded_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Complaint $complaint) {
            if (empty($complaint->code)) {
                $complaint->code = 'LR-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
            }

            if (empty($complaint->status)) {
                $complaint->status = 'pending';
            }
        });

        static::saving(function (Complaint $complaint) {
            if (blank($complaint->responded_at) && (
                filled($complaint->response) || $complaint->status === 'resolved'
            )) {
                $complaint->responded_at = now();
            }
        });
    }

    public function getTypeLabelAttribute(): string
    {
        return $this->type === 'reclamo' ? 'Reclamo' : 'Queja';
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'in_review' => 'En revisión',
            'resolved' => 'Resuelto',
            'rejected' => 'Rechazado',
            default => 'Pendiente',
        };
    }
}
