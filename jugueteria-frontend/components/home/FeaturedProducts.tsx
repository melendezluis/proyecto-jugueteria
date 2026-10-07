'use client';

import { useRef, useCallback, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';

const PREVIEW_COUNT = 5;

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  const scroll = useCallback((direction: number) => {
    scrollRef.current?.scrollBy({ left: direction * 640, behavior: 'smooth' });
  }, []);

  if (products.length === 0) return null;

  const previewProducts = products.slice(0, PREVIEW_COUNT);
  const hasMore = products.length > PREVIEW_COUNT;

  return (
    <section aria-label="Productos destacados">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-[#2B2D42] font-fredoka tracking-wide">
          Los más queridos
        </h2>
      </div>

      {expanded ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => setExpanded(false)}
              className="group inline-flex items-center gap-3 bg-white border-2 border-[#6EBA92] text-[#4F916C] hover:bg-[#EAF6EF] font-bold text-base sm:text-lg px-10 py-4 rounded-full transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.25}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
              Ver menos
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {previewProducts.map(product => (
                <div key={product.id} className="w-[300px] shrink-0 snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            <button
              onClick={() => scroll(-1)}
              aria-label="Desplazar destacados a la izquierda"
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-100 text-[#5390D9] text-2xl font-bold items-center justify-center hover:bg-[#E7F3FF] transition-colors z-10"
            >
              ‹
            </button>
            <button
              onClick={() => scroll(1)}
              aria-label="Desplazar destacados a la derecha"
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-100 text-[#5390D9] text-2xl font-bold items-center justify-center hover:bg-[#E7F3FF] transition-colors z-10"
            >
              ›
            </button>
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setExpanded(true)}
                className="group inline-flex items-center gap-3 bg-[#6EBA92] hover:bg-[#4F916C] text-white font-bold text-base sm:text-lg px-10 py-4 rounded-full shadow-lg shadow-[#6EBA92]/30 hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95"
              >
                Ver más
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.25}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="m19 12-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}