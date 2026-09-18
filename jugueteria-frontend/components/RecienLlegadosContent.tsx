'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';

type SortOption = 'az' | 'za' | 'price_asc' | 'price_desc';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'az', label: 'Alfabéticamente A-Z' },
  { id: 'za', label: 'Alfabéticamente Z-A' },
  { id: 'price_asc', label: 'Precio menor a mayor' },
  { id: 'price_desc', label: 'Precio mayor a menor' },
];

function effectivePrice(p: Product): number {
  return p.offer_price ?? p.price;
}

export default function RecienLlegadosContent({ products }: { products: Product[] }) {
  const [sort, setSort] = useState<SortOption>('az');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const sortedProducts = useMemo(() => {
    const arr = [...products];
    switch (sort) {
      case 'az':
        arr.sort((a, b) => a.name.localeCompare(b.name, 'es'));
        break;
      case 'za':
        arr.sort((a, b) => b.name.localeCompare(a.name, 'es'));
        break;
      case 'price_asc':
        arr.sort((a, b) => effectivePrice(a) - effectivePrice(b));
        break;
      case 'price_desc':
        arr.sort((a, b) => effectivePrice(b) - effectivePrice(a));
        break;
    }
    return arr;
  }, [products, sort]);

  const activeLabel = SORT_OPTIONS.find(o => o.id === sort)?.label ?? 'Características';

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#6EBA92] flex items-center justify-center shadow-lg shadow-[#6EBA92]/40 flex-shrink-0">
            <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FFD23F] border-2 border-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2B2D42]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l1.8 5h5.2l-4.3 3.3 1.7 5.7-4.4-3.1-4.4 3.1 1.7-5.7L5 7h5.2z" />
              </svg>
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="8" width="18" height="4" rx="1" />
              <path d="M12 8v13" />
              <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
              <path d="M7.5 8a2.5 2.5 0 0 1 0-5C9 3 12 4 12 8Z" />
              <path d="M16.5 8a2.5 2.5 0 0 0 0-5C15 3 12 4 12 8Z" />
            </svg>
          </div>
          <div>
            <h1 className="font-fredoka text-3xl sm:text-4xl font-bold text-[#2B2D42] tracking-wide">
              Recién Llegados
            </h1>
            <p className="text-[#2B2D42]/60 mt-1">
              {sortedProducts.length}{' '}
              {sortedProducts.length === 1 ? 'juguete nuevo' : 'juguetes nuevos'} en la tienda
            </p>
          </div>
        </div>

        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-haspopup="menu"
            aria-expanded={open}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full transition-colors border-2 ${
              open
                ? 'border-[#6EBA92] bg-[#6EBA92] text-white'
                : 'border-gray-200 bg-white text-[#2B2D42] hover:border-[#6EBA92]'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 12h12M10 20h4" />
            </svg>
            Características
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div
              role="menu"
              aria-label="Ordenar por características"
              className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
            >
              <p className="px-4 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                Ordenar por
              </p>
              <div className="py-1">
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    role="menuitem"
                    onClick={() => {
                      setSort(option.id);
                      setOpen(false);
                    }}
                    className={`group w-full flex items-center justify-between gap-3 text-left px-4 py-2.5 text-sm transition-colors ${
                      sort === option.id
                        ? 'text-[#072652] font-semibold'
                        : 'text-gray-600 hover:text-[#072652]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full transition-colors ${
                          sort === option.id ? 'bg-[#FF8A65]' : 'bg-transparent group-hover:bg-gray-300'
                        }`}
                      />
                      {option.label}
                    </span>
                    {sort === option.id && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-[#FF8A65]">
                        <path
                          d="M2.5 7.5L5.5 10.5L11.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Orden actual: <span className="font-semibold text-[#2B2D42]">{activeLabel}</span>
      </p>

      {sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
          <span className="text-6xl block mb-4">😿</span>
          <h2 className="text-2xl text-gray-500 font-fredoka">No hay juguetes nuevos por ahora</h2>
          <p className="text-gray-400 mt-2">Vuelve pronto, estamos trayendo más juguetes.</p>
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-2.5 bg-[#FF8A65] hover:bg-[#E67A55] text-white rounded-full font-medium transition-colors"
          >
            Ver todos los juguetes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="text-center mt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#6EBA92] hover:bg-[#4E9A72] text-white font-semibold px-8 py-3 rounded-full transition-all active:scale-95 shadow-md"
        >
          ← Volver a la tienda
        </Link>
      </div>
    </>
  );
}