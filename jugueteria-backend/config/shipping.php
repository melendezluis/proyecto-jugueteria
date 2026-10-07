<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Envío
    |--------------------------------------------------------------------------
    |
    | El costo del envío se calcula SIEMPRE en el servidor para que el cliente
    | no pueda manipularlo. Si quieres envío gratis a partir de cierto monto,
    | define SHIPPING_FREE_THRESHOLD en tu .env (ej. 200 = gratis desde S/ 200);
    | déjalo vacío para cobrar la tarifa plana siempre.
    |
    */

    'flat_rate' => (float) env('SHIPPING_FLAT_RATE', 10),

    'free_threshold' => env('SHIPPING_FREE_THRESHOLD') === '' || env('SHIPPING_FREE_THRESHOLD') === null
        ? null
        : (float) env('SHIPPING_FREE_THRESHOLD'),
];
