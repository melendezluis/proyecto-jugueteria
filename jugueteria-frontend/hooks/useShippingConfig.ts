'use client';

import { useEffect, useState } from 'react';
import { getShippingConfig, type ShippingConfig } from '@/services/api';

const FALLBACK: ShippingConfig = {
  flat_rate: 10,
  free_threshold: null,
  local_rate: 5,
  nearby_rate: 10,
  local_radius_km: 5,
  max_radius_km: 15,
  center: { lat: -11.5681, lng: -77.2697 },
};

export function useShippingConfig(): ShippingConfig {
  const [config, setConfig] = useState<ShippingConfig>(FALLBACK);

  useEffect(() => {
    let mounted = true;
    getShippingConfig()
      .then(res => {
        if (mounted) setConfig(res.data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return config;
}

export type ShippingZone = 'chancay' | 'nearby' | 'unknown' | 'out_of_coverage';

export interface ShippingQuote {
  available: boolean;
  zone: ShippingZone;
  rate: number | null;
  distanceKm: number | null;
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadius = 6371;
  const latDelta = ((lat2 - lat1) * Math.PI) / 180;
  const lngDelta = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(lngDelta / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function quoteShipping(
  subtotal: number,
  config: ShippingConfig,
  lat?: number | null,
  lng?: number | null
): ShippingQuote {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return { available: false, zone: 'unknown', rate: null, distanceKm: null };
  }

  const distance = distanceKm(config.center.lat, config.center.lng, lat, lng);

  if (distance > config.max_radius_km) {
    return {
      available: false,
      zone: 'out_of_coverage',
      rate: null,
      distanceKm: distance,
    };
  }

  const isLocal = distance <= config.local_radius_km;
  let rate = isLocal ? config.local_rate : config.nearby_rate;

  if (subtotal <= 0) {
    rate = 0;
  } else if (config.free_threshold !== null && subtotal >= config.free_threshold) {
    rate = 0;
  }

  return {
    available: true,
    zone: isLocal ? 'chancay' : 'nearby',
    rate,
    distanceKm: distance,
  };
}
