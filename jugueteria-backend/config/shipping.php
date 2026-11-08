<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Envío por zonas
    |--------------------------------------------------------------------------
    |
    | El costo se calcula SIEMPRE en el servidor usando la ubicación marcada en
    | el mapa. El punto de referencia es la tienda en Chancay:
    |
    | - Dentro del radio local: tarifa local (Chancay).
    | - Hasta el radio máximo: tarifa de zonas cercanas (Chancayllo, Peralvillo,
    |   Huaral, Quepepampa, Chacraymar, etc.).
    | - Más allá del radio máximo: sin cobertura (el cliente puede elegir recojo
    |   en tienda).
    |
    */

    'center' => [
        'lat' => (float) env('SHIPPING_CENTER_LAT', -11.5681),
        'lng' => (float) env('SHIPPING_CENTER_LNG', -77.2697),
    ],

    'local_rate' => (float) env('SHIPPING_LOCAL_RATE', 5),
    'nearby_rate' => (float) env('SHIPPING_NEARBY_RATE', 10),
    'local_radius_km' => (float) env('SHIPPING_LOCAL_RADIUS_KM', 5),
    'max_radius_km' => (float) env('SHIPPING_MAX_RADIUS_KM', 15),

    /*
    |--------------------------------------------------------------------------
    | Tarifa de respaldo
    |--------------------------------------------------------------------------
    |
    | Se usa solo cuando una orden se crea por API sin coordenadas (por ejemplo,
    | integraciones antiguas). El checkout siempre envía la ubicación del mapa.
    |
    */

    'flat_rate' => (float) env('SHIPPING_FLAT_RATE', 10),

    'free_threshold' => env('SHIPPING_FREE_THRESHOLD') === '' || env('SHIPPING_FREE_THRESHOLD') === null
        ? null
        : (float) env('SHIPPING_FREE_THRESHOLD'),
];
