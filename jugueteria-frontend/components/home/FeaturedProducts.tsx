'use client';

import { useRef, useCallback } from 'react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: number) => {
    scrollRef.current?.scrollBy({ left: direction * 640, behavior: 'smooth' });
  }, []);

  if (products.length === 0) return null;

  return (
    <section aria-label="Productos destacados">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-[#2B2D42] font-fredoka tracking-wide">
          Los más queridos 🧡
        </h2>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map(product => (
            <div key={product.id} className="w-[300px] shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll(-1)}
          aria-label="Desplazar destacados a la izquierda"
          className="absolute -left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-100 text-[#5390D9] text-2xl font-bold flex items-center justify-center hover:bg-[#E7F3FF] transition-colors z-10"
        >
          ‹
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Desplazar destacados a la derecha"
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-100 text-[#5390D9] text-2xl font-bold flex items-center justify-center hover:bg-[#E7F3FF] transition-colors z-10"
        >
          ›
        </button>
      </div>
    </section>
  );
}
