<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Cancela pedidos pendientes de pago vencidos y libera stock (requiere el scheduler/cron activo)
Schedule::command('orders:expire-pending', ['--minutes' => 30])->everyFiveMinutes();
