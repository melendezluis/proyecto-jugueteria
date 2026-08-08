<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Mercado Pago
    |--------------------------------------------------------------------------
    |
    | Credenciales de la pasarela de pagos. Usa credenciales de prueba (TEST-*)
    | en desarrollo y credenciales de producción (APP_USR-*) en producción.
    |
    */

    'access_token' => env('MP_ACCESS_TOKEN'),

    'webhook_secret' => env('MP_WEBHOOK_SECRET'),

    'webhook_url' => env('MP_WEBHOOK_URL'),

    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
];
