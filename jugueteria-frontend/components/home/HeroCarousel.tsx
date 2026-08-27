'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Slide {
  emoji: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  bg: string;
}

const SLIDES: Slide[] = [
  {
    emoji: '🧸',
    title: '¡Bienvenido a la diversión!',
    subtitle: 'Los juguetes más divertidos para todas las edades',
    ctaLabel: 'Explorar juguetes',
    ctaHref: '#productos',
    bg: 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600',
  },
  {
    emoji: '🎉',
    title: 'Hasta 50% de descuento',
    subtitle: 'Aprovecha las mejores ofertas de la semana antes que se agoten',
    ctaLabel: 'Ver ofertas',
    ctaHref: '#ofertas',
    bg: 'bg-gradient-to-br from-pink-400 via-fuchsia-500 to-purple-600',
  },
  {
    emoji: '🚀',
    title: 'Envío express a toda Lima',
    subtitle: 'Recibe tu pedido en menos de 24 horas',
    ctaLabel: 'Comprar ahora',
    ctaHref: '#productos',
    bg: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600',
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || SLIDES.length <= 1) return;
    const id = setInterval(() => {
      setIndex(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused]);

  const goTo = (i: number) => setIndex((i + SLIDES.length) % SLIDES.length);

  return (
    <section
      aria-label="Promociones destacadas"
      className="relative rounded-3xl overflow-hidden shadow-xl group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex h-[320px] md:h-[420px] transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map(slide => (
          <div
            key={slide.title}
            className={`w-full shrink-0 relative flex items-center ${slide.bg}`}
          >
            <span className="absolute inset-0 opacity-20 text-[16rem] md:text-[22rem] leading-none select-none pointer-events-none -right-10 -bottom-16 rotate-12">
              {slide.emoji}
            </span>
            <div className="relative z-10 max-w-2xl px-8 md:px-14">
              <p className="text-7xl md:text-8xl mb-4 drop-shadow-lg">{slide.emoji}</p>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-md font-nunito leading-tight">
                {slide.title}
              </h2>
              <p className="text-base md:text-xl text-white/90 mb-6 max-w-md">
                {slide.subtitle}
              </p>
              <Link
                href={slide.ctaHref}
                className="inline-block bg-white text-gray-900 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-yellow-300 hover:scale-105 active:scale-95 transition-all"
              >
                {slide.ctaLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => goTo(index - 1)}
        aria-label="Anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/30 backdrop-blur-sm text-white text-xl font-bold flex items-center justify-center hover:bg-white/60 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        ‹
      </button>
      <button
        onClick={() => goTo(index + 1)}
        aria-label="Siguiente"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/30 backdrop-blur-sm text-white text-xl font-bold flex items-center justify-center hover:bg-white/60 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        ›
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Ir al slide ${i + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
