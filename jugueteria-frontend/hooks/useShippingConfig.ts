'use client';

import { useEffect, useState } from 'react';
import { getShippingConfig, type ShippingConfig } from '@/services/api';

const FALLBACK: ShippingConfig = { flat_rate: 10, free_threshold: null };

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

export function calculateShipping(subtotal: number, config: ShippingConfig): number {
  if (subtotal <= 0) return 0;
  if (config.free_threshold !== null && subtotal >= config.free_threshold) return 0;
  return config.flat_rate;
}