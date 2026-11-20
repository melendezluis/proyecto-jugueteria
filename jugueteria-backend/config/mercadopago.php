<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Mercado Pago
    |--------------------------------------------------------------------------
    |
    | Credenciales de la pasarela de pagos. Usa las credenciales de la pestaña
    | Prueba en desarrollo y las de Producción en producción. El Access Token
    | de prueba puede comenzar con APP_USR.
    |
    */

    'access_token' => env('MP_ACCESS_TOKEN'),

    'webhook_secret' => env('MP_WEBHOOK_SECRET'),

    'webhook_url' => env('MP_WEBHOOK_URL'),

    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
];
