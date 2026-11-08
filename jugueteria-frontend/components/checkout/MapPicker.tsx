'use client';

import { useCallback, useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER: [number, number] = [-11.5681, -77.2697];

const pinIcon = L.divIcon({
  className: '',
  html: '<svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.163 0 0 7.163 0 16c0 11.5 16 26 16 26s16-14.5 16-26C32 7.163 24.837 0 16 0Z" fill="#287FF0"/><circle cx="16" cy="16" r="6" fill="white"/></svg>',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
});

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function MapViewSync({ position }: { position: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, Math.max(map.getZoom(), 17));
    }
  }, [map, position]);

  return null;
}

export interface PickedAddress {
  address: string;
  number: string;
}

async function reverseGeocode(lat: number, lng: number): Promise<PickedAddress | null> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(lat),
    lon: String(lng),
    zoom: '18',
    addressdetails: '1',
    'accept-language': 'es',
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) return null;

  const data = await response.json();
  const address = data.address ?? {};
  const street = [address.road, address.house_number].filter(Boolean).join(' ');
  const firstLine = street || (typeof data.display_name === 'string' ? data.display_name.split(',')[0].trim() : '');
  const parts = [
    firstLine,
    address.neighbourhood || address.suburb,
    address.city || address.town || address.village || address.county,
    address.state,
  ].filter(Boolean);

  const resolved = parts.length > 0 ? parts.join(', ') : (data.display_name ?? null);

  if (!resolved) return null;

  return {
    address: resolved,
    number: typeof address.house_number === 'string' ? address.house_number : '',
  };
}

export interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onPick: (lat: number, lng: number, address: PickedAddress | null) => void;
}

export default function MapPicker({ latitude, longitude, onPick }: MapPickerProps) {
  const [selected, setSelected] = useState<[number, number] | null>(
    latitude !== null && longitude !== null ? [latitude, longitude] : null
  );
  const [resolving, setResolving] = useState(false);
  const [geoError, setGeoError] = useState('');

  const handlePick = useCallback(
    async (lat: number, lng: number) => {
      setSelected([lat, lng]);
      setGeoError('');
      setResolving(true);

      let address: PickedAddress | null = null;
      try {
        address = await reverseGeocode(lat, lng);
      } catch {
        address = null;
      } finally {
        setResolving(false);
      }

      onPick(lat, lng, address);
    },
    [onPick]
  );

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no permite obtener tu ubicación.');
      return;
    }

    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      position => {
        void handlePick(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setGeoError('No pudimos obtener tu ubicación. Puedes marcar el punto manualmente.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="relative z-0 w-full h-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-gray-200">
        <MapContainer
          center={selected ?? DEFAULT_CENTER}
          zoom={selected ? 17 : 14}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onPick={handlePick} />
          <MapViewSync position={selected} />
          {selected && <Marker position={selected} icon={pinIcon} />}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B66D0] bg-[#E7EBFE] hover:bg-[#D8E2FD] px-3.5 py-2 rounded-xl transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
          Usar mi ubicación
        </button>
        <p className="text-xs text-gray-500">
          {resolving ? 'Buscando la dirección del punto...' : 'Haz clic en el mapa para marcar tu dirección.'}
        </p>
      </div>

      {geoError && <p className="text-sm text-red-600">{geoError}</p>}
    </div>
  );
}
