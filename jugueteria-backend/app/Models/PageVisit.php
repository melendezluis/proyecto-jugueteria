<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageVisit extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'path',
        'visitor_hash',
        'visited_at',
    ];

    protected $casts = [
        'visited_at' => 'datetime',
    ];
}
