'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/types';

function formatTime(value: number): string {
  return value.toString().padStart(2, '0');
}

function getTimeLeft(): { hours: number; minutes: number; seconds: number } | null {
  const now = new Date();
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return null;
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

export default function OffersSection({ offers }: { offers: Product[] }) {
  if (offers.length === 0) return null;
  return <OffersContent offers={offers} />;
}

function OffersContent({ offers }: { offers: Product[] }) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setTimeLeft(getTimeLeft());
    const raf = requestAnimationFrame(update);
    const id = setInterval(update, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  const scroll = useCallback((direction: number) => {
    scrollRef.current?.scrollBy({ left: direction * 640, behavior: 'smooth' });
  }, []);

  return (
    <section id="ofertas" aria-label="Ofertas de la semana">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-4xl font-bold text-[#2B2D42] font-fredoka tracking-wide">
            Ofertas de la semana
          </h2>
          <span className="bg-pink-500 text-white text-sm font-bold px-3 py-1.5 rounded-full animate-pulse">
            🔥 ¡Aprovecha!
          </span>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500 font-semibold hidden sm:block">Termina en:</p>
          <div className="flex items-center gap-1.5" aria-live="polite">
            <TimeBox label="hrs" value={timeLeft ? formatTime(timeLeft.hours) : '--'} />
            <span className="text-xl font-bold text-[#2B2D42]">:</span>
            <TimeBox label="min" value={timeLeft ? formatTime(timeLeft.minutes) : '--'} />
            <span className="text-xl font-bold text-[#2B2D42]">:</span>
            <TimeBox label="seg" value={timeLeft ? formatTime(timeLeft.seconds) : '--'} />
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {offers.map(product => (
            <OfferCard key={product.id} product={product} />
          ))}
        </div>

        <button
          onClick={() => scroll(-1)}
          aria-label="Desplazar ofertas a la izquierda"
          className="absolute -left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-100 text-[#5390D9] text-2xl font-bold flex items-center justify-center hover:bg-[#E7F3FF] transition-colors z-10"
        >
          ‹
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Desplazar ofertas a la derecha"
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-100 text-[#5390D9] text-2xl font-bold flex items-center justify-center hover:bg-[#E7F3FF] transition-colors z-10"
        >
          ›
        </button>
      </div>
    </section>
  );
}

function TimeBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center bg-[#2B2D42] text-white rounded-xl px-3 py-1.5 min-w-[52px]">
      <span className="text-xl font-bold tabular-nums leading-none">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">{label}</span>
    </div>
  );
}

function OfferCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const hasOffer = product.offer_price !== null && product.offer_price < product.price;
  const discount = hasOffer ? Math.round((1 - product.offer_price! / product.price) * 100) : 0;

  return (
    <article className="w-[280px] shrink-0 snap-start bg-[#E7EBFE] rounded-3xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col">
      <Link href={`/products/${product.slug}`} className="block relative">
        <div className="h-44 bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-7xl group-hover:scale-105 transition-transform">
          🧸
        </div>
        <span className="absolute top-3 left-3 bg-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
          -{discount}%
        </span>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-base text-gray-800 line-clamp-2 h-12 hover:text-blue-900 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-2xl font-bold text-pink-600">
              S/ {product.offer_price!.toFixed(2)}
            </p>
            <p className="text-sm text-gray-400 line-through">
              S/ {product.price.toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => addItem(product)}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#C4785C] hover:bg-[#B56A4E] text-white font-semibold py-2.5 rounded-2xl transition-all active:scale-95 shadow-md shadow-[#C4785C]/30 btn-shimmer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            Agregar al carrito
          </button>
        </div>
      </div>
    </article>
  );
}
