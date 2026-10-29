'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Slide {
  emoji: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  bg: string;
  image?: string;
}

const SLIDES: Slide[] = [
  {
    emoji: '',
    title: '',
    subtitle: '',
    ctaLabel: 'Explorar juguetes',
    ctaHref: '#productos',
    bg: 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600',
    image: '/images/anuncio3.jpg',
  },
  {
    emoji: '',
    title: '',
    subtitle: '',
    ctaLabel: 'Ver ofertas',
    ctaHref: '/descuentos',
    bg: 'bg-gradient-to-br from-pink-400 via-fuchsia-500 to-purple-600',
    image: '/images/anuncio7.jfif',
  },
  {
    emoji: '',
    title: '',
    subtitle: '',
    ctaLabel: 'Recién llegados',
    ctaHref: '/recien-llegados',
    bg: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
    image: '/images/anuncio6.jfif',
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
        className="flex h-[200px] sm:h-[280px] md:h-[380px] lg:h-[420px] transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={slide.title || i}
            className={`w-full shrink-0 relative flex items-center ${slide.bg}`}
          >
            {slide.image ? (
              <Image
                src={slide.image}
                alt="Anuncio"
                fill
                className="object-cover object-center"
                priority={i === 0}
                sizes="100vw"
              />
            ) : (
              <span className="absolute inset-0 opacity-20 text-[16rem] md:text-[22rem] leading-none select-none pointer-events-none -right-10 -bottom-16 rotate-12">
                {slide.emoji}
              </span>
            )}

            <div className="relative z-10 max-w-2xl px-8 md:px-14">
              {slide.title && (
                <>
                  <p className="text-7xl md:text-8xl mb-4 drop-shadow-lg">{slide.emoji}</p>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-md font-nunito leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-base md:text-xl text-white/90 mb-6 max-w-md">
                    {slide.subtitle}
                  </p>
                </>
              )}
            </div>

            {/* Botón CTA con entorno cálido que combina con el amarillo */}
            <Link
              href={slide.ctaHref}
              className="absolute z-20 bottom-8 left-12 md:left-20
           bg-gradient-to-b from-yellow-300 to-amber-400
           text-gray-900 text-sm font-bold px-4 md:px-5 py-1.5 md:py-2 rounded-full
           ring-1 ring-amber-200/80
           shadow-[0_0_0_3px_rgba(253,224,71,0.35),0_6px_16px_-4px_rgba(245,158,11,0.6)]
           hover:from-yellow-200 hover:to-amber-300 hover:ring-amber-100
           hover:shadow-[0_0_0_4px_rgba(253,224,71,0.45),0_8px_20px_-4px_rgba(245,158,11,0.7)]
           hover:scale-105 active:scale-95 transition-all"
            >
              {slide.ctaLabel}
            </Link>
          </div>
        ))}
      </div>

      <button
        onClick={() => goTo(index - 1)}
        aria-label="Anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/30 backdrop-blur-sm text-white text-xl font-bold flex items-center justify-center hover:bg-white/60 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
      >
        ‹
      </button>
      <button
        onClick={() => goTo(index + 1)}
        aria-label="Siguiente"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/30 backdrop-blur-sm text-white text-xl font-bold flex items-center justify-center hover:bg-white/60 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
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