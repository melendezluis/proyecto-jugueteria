<?php

namespace App\Support;

final class Shipping
{
    public const ZONE_CHANCAY = 'chancay';

    public const ZONE_NEARBY = 'nearby';

    public const ZONE_OUT_OF_COVERAGE = 'out_of_coverage';

    public const ZONE_UNKNOWN = 'unknown';

    /**
     * Cotiza el envío según la distancia desde la tienda en Chancay.
     *
     * @return array{available: bool, zone: string, rate: float|null, distance_km: float|null}
     */
    public static function quote(?float $lat, ?float $lng): array
    {
        if ($lat === null || $lng === null) {
            return [
                'available' => true,
                'zone' => self::ZONE_UNKNOWN,
                'rate' => (float) config('shipping.flat_rate'),
                'distance_km' => null,
            ];
        }

        $center = config('shipping.center');
        $distance = self::distanceKm(
            (float) $center['lat'],
            (float) $center['lng'],
            $lat,
            $lng
        );

        if ($distance > (float) config('shipping.max_radius_km')) {
            return [
                'available' => false,
                'zone' => self::ZONE_OUT_OF_COVERAGE,
                'rate' => null,
                'distance_km' => round($distance, 2),
            ];
        }

        $isLocal = $distance <= (float) config('shipping.local_radius_km');

        return [
            'available' => true,
            'zone' => $isLocal ? self::ZONE_CHANCAY : self::ZONE_NEARBY,
            'rate' => (float) ($isLocal
                ? config('shipping.local_rate')
                : config('shipping.nearby_rate')),
            'distance_km' => round($distance, 2),
        ];
    }

    /**
     * @return array{available: bool, zone: string, rate: float|null, distance_km: float|null}
     */
    public static function calculate(float $subtotal, ?float $lat = null, ?float $lng = null): array
    {
        $quote = self::quote($lat, $lng);
        $freeThreshold = config('shipping.free_threshold');

        if ($quote['available'] && $freeThreshold !== null && $subtotal >= $freeThreshold) {
            $quote['rate'] = 0.0;
        }

        return $quote;
    }

    private static function distanceKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371.0;
        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);

        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($lngDelta / 2) ** 2;

        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
