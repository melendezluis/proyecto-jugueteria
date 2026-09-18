'use client';

import Link from 'next/link';

interface PromoConfig {
  href: string;
  label: string;
  base: string;
  hover: string;
  edge: string;
  edgeHover: string;
  iconClass: string;
  iconHoverClass: string;
  icon: React.ReactNode;
  className?: string;
}

const PROMOS: PromoConfig[] = [
  {
    href: '/recien-llegados',
    label: 'Recién Llegados',
    base: '#FF5D73',
    hover: '#F23E58',
    edge: '#C43850',
    edgeHover: '#A82E44',
    iconClass: 'text-[#FF5D73]',
    iconHoverClass: 'group-hover:text-[#F23E58]',
    icon: (
      // 🎁 Caja de regalo (Novedad)
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    href: '/envio-express',
    label: 'Envío Express',
    base: '#FFA23E',
    hover: '#F58A1F',
    edge: '#D97F1E',
    edgeHover: '#B86A18',
    iconClass: 'text-[#FFA23E]',
    iconHoverClass: 'group-hover:text-[#F58A1F]',
    icon: (
      // 🚀 Cohete (Velocidad)
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
  },
  {
    href: '/pack-de-juegos',
    label: 'Pack de Juegos',
    base: '#2FB0E8',
    hover: '#159CD9',
    edge: '#1D82B0',
    edgeHover: '#166A93',
    iconClass: 'text-[#2FB0E8]',
    iconHoverClass: 'group-hover:text-[#159CD9]',
    icon: (
      // 🧸 Bloques de construcción (Juegos)
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/descuentos',
    label: 'Juguetes en Descuento',
    // 🎨 COLORES ACTUALIZADOS A ROSA FUERTE (#EC4899)
    base: '#EC4899',      // Rosa fuerte
    hover: '#DB2777',     // Rosa más oscuro al pasar el mouse
    edge: '#BE185D',      // Borde 3D oscuro
    edgeHover: '#9D174D', // Borde 3D más oscuro al presionar
    iconClass: 'text-[#EC4899]',
    iconHoverClass: 'group-hover:text-[#DB2777]',
    icon: (
      // 🏷️ Etiqueta de descuento (Oferta)
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
        <path d="M16 8l-6 6" /> {/* Pequeña línea extra para simular el "corte" de precio */}
      </svg>
    ),
    className: 'hidden lg:flex',
  },
];

function PromoPill({ promo }: { promo: PromoConfig }) {
  return (
    <Link
      href={promo.href}
      style={
        {
          '--base': promo.base,
          '--hover': promo.hover,
          '--edge': promo.edge,
          '--edge-hover': promo.edgeHover,
          backgroundColor: 'var(--base)',
          boxShadow: `0 3px 0 0 var(--edge)`,
        } as React.CSSProperties
      }
      className={`group relative flex-shrink-0 items-center gap-2 whitespace-nowrap
        rounded-xl pl-1.5 pr-3.5 py-1.5
        text-sm font-extrabold text-white
        transition-all duration-150 ease-out
        hover:bg-[var(--hover)]
        hover:translate-y-[2px]
        hover:shadow-[0_1px_0_0_var(--edge-hover)]
        active:translate-y-[3px]
        active:shadow-none
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white
        ${promo.className ?? 'flex'}`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
        <span className={`${promo.iconClass} ${promo.iconHoverClass} transition-colors duration-150`}>
          {promo.icon}
        </span>
      </span>
      <span>{promo.label}</span>
    </Link>
  );
}

export default function PromoBar() {
  return (
    <>
      {PROMOS.map(promo => (
        <PromoPill key={promo.href} promo={promo} />
      ))}
    </>
  );
}