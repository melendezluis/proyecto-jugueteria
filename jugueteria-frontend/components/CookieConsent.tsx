'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'elgato-cookie-consent';

type Consent = 'accepted' | 'essential';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setVisible(!window.localStorage.getItem(STORAGE_KEY));
      } catch {
        setVisible(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function saveConsent(value: Consent) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice: value, date: new Date().toISOString() })
      );
    } catch {
      // Si el navegador bloquea el almacenamiento, solo ocultamos el aviso.
    }
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-3xl rounded-2xl border border-[#2B2D42]/15 bg-white p-4 shadow-2xl shadow-black/15 sm:inset-x-6 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#E7F5ED] text-[#3F7357]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m-15.432 0A8.959 8.959 0 0 1 3 12c0-.778.099-1.533.284-2.253"
              />
            </svg>
          </span>
          <div>
            <p className="text-sm font-bold text-[#2B2D42]">
              Usamos almacenamiento esencial
            </p>
            <p className="mt-1 text-xs leading-5 text-[#2B2D42]/65">
              Necesitamos guardar tu carrito, tu sesión y tus preferencias para que
              la tienda funcione. No usamos cookies publicitarias.{' '}
              <Link
                href="/politica-de-cookies"
                className="font-semibold text-[#1B66D0] underline underline-offset-2"
              >
                Ver política de cookies
              </Link>
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={() => saveConsent('essential')}
            className="flex-1 rounded-xl border-2 border-[#2B2D42]/15 px-4 py-2.5 text-xs font-bold text-[#2B2D42]/70 transition-colors hover:border-[#2B2D42]/30 sm:flex-none"
          >
            Solo esenciales
          </button>
          <button
            type="button"
            onClick={() => saveConsent('accepted')}
            className="flex-1 rounded-xl bg-[#5EA57E] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#4E8A68] sm:flex-none"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
