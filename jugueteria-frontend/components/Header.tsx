'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { getBrands, getCategories } from '@/services/api';
import type { Brand, Category } from '@/types';

type MenuId = 'categorias' | 'marcas' | 'edades' | 'precio';

interface AgeRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

const AGE_RANGES: AgeRange[] = [
  { id: '0-2', label: 'Bebés (0 - 2 años)', min: 0, max: 2 },
  { id: '3-5', label: 'Preescolar (3 - 5 años)', min: 3, max: 5 },
  { id: '6-8', label: 'Escolar (6 - 8 años)', min: 6, max: 8 },
  { id: '9-12', label: 'Niños (9 - 12 años)', min: 9, max: 12 },
  { id: '12+', label: 'Mayores de 12 años', min: 12, max: 999 },
];

const PRICE_RANGES: PriceRange[] = [
  { id: '0-50', label: 'Menos de S/ 50', min: 0, max: 49.99 },
  { id: '50-100', label: 'S/ 50 - S/ 100', min: 50, max: 99.99 },
  { id: '100-200', label: 'S/ 100 - S/ 200', min: 100, max: 199.99 },
  { id: '200+', label: 'Más de S/ 200', min: 200, max: Infinity },
];

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      role="menuitem"
      className={`group w-full flex items-center justify-between gap-3 text-left px-4 py-2.5 text-sm transition-colors ${
        active ? 'text-[#072652] font-semibold' : 'text-gray-600 hover:text-[#072652]'
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors ${
            active ? 'bg-[#FF8A65]' : 'bg-transparent group-hover:bg-gray-300'
          }`}
        />
        {children}
      </span>
      {active && (
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
  );
}

function FilterDropdown({
  id,
  label,
  active,
  openMenu,
  setOpenMenu,
  children,
  align = 'left',
}: {
  id: MenuId;
  label: string;
  active: boolean;
  openMenu: MenuId | null;
  setOpenMenu: (menu: MenuId | null) => void;
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  const isOpen = openMenu === id;
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverDevice = useRef<boolean>(
    typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  );

  useEffect(() => {
    if (!isOpen) return;

    if (containerRef.current && containerRef.current.getClientRects().length === 0) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenMenu(null);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, setOpenMenu]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => {
        if (hoverDevice.current) setOpenMenu(id);
      }}
      onMouseLeave={() => {
        if (hoverDevice.current) setOpenMenu(null);
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setOpenMenu(isOpen ? null : id)}
        className={`cursor-pointer transition-colors flex items-center gap-1.5 text-xl ${
          isOpen || active ? 'text-white font-semibold' : 'hover:text-white'
        }`}
      >
        {label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            d="M1.5 3L5 6.5L8.5 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        className={`absolute top-full w-64 pt-2 z-50 origin-top transition-all duration-150 ${
          align === 'right' ? 'right-0' : 'left-0'
        } ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div
          role="menu"
          className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <p className="px-4 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            {label}
          </p>
          <div className="max-h-72 overflow-y-auto py-1" onClickCapture={() => setOpenMenu(null)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, toggleCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCategories().catch(() => ({ data: [] })), getBrands().catch(() => ({ data: [] }))])
      .then(([cats, brs]) => {
        setCategories((cats as any).data || []);
        setBrands((brs as any).data || []);
      })
      .catch(() => {});
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  const applyFilter = (params: Record<string, string>) => {
    const url = new URL(window.location.href);
    url.pathname = '/';
    Object.keys(params).forEach(k => {
      if (params[k]) url.searchParams.set(k, params[k]);
      else url.searchParams.delete(k);
    });
    window.location.href = url.toString();
  };

  const handleCategoryChange = (id: number | null) => {
    setSelectedCategory(id);
    setOpenMenu(null);
    if (id) {
      const cat = categories.find(c => c.id === id);
      const url = new URL(window.location.href);
      url.pathname = '/';
      url.searchParams.delete('brand_id');
      url.searchParams.delete('brand');
      url.searchParams.delete('category');
      url.searchParams.set('category_id', String(id));
      window.location.href = url.toString();
    } else {
      const url = new URL(window.location.href);
      url.pathname = '/';
      url.searchParams.delete('category_id');
      url.searchParams.delete('category');
      url.searchParams.delete('brand_id');
      url.searchParams.delete('brand');
      window.location.href = url.toString();
    }
  };

  const handleBrandChange = (id: number | null) => {
    setSelectedBrand(id);
    setOpenMenu(null);
    if (id) {
      const url = new URL(window.location.href);
      url.pathname = '/';
      url.searchParams.delete('category_id');
      url.searchParams.delete('category');
      url.searchParams.delete('brand');
      url.searchParams.set('brand_id', String(id));
      window.location.href = url.toString();
    } else {
      const url = new URL(window.location.href);
      url.pathname = '/';
      url.searchParams.delete('brand_id');
      url.searchParams.delete('brand');
      url.searchParams.delete('category_id');
      url.searchParams.delete('category');
      window.location.href = url.toString();
    }
  };

  const handleAgeChange = (id: string | null) => {
    setSelectedAge(id);
    setOpenMenu(null);
    const range = AGE_RANGES.find(r => r.id === id);
    if (range) {
      applyFilter({ min_age: String(range.min), max_age: range.max >= 999 ? '' : String(range.max) });
    } else {
      applyFilter({ min_age: '', max_age: '' });
    }
  };

  const handlePriceChange = (id: string | null) => {
    setSelectedPrice(id);
    setOpenMenu(null);
    const range = PRICE_RANGES.find(r => r.id === id);
    if (range) {
      applyFilter({ min_price: range.min === 0 ? '' : String(range.min), max_price: range.max === Infinity ? '' : String(range.max) });
    } else {
      applyFilter({ min_price: '', max_price: '' });
    }
  };

  return (
    <header className="bg-[#6EBA92] shadow-sm fixed top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-15 py-5 flex justify-between items-center gap-4">
        <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
          <div className="flex items-center gap-3 cursor-pointer flex-shrink-0">
            <Link href="/" className="flex items-center gap-3" aria-label="Ir al inicio">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white bg-white flex-shrink-0">
                <Image
                  src="/images/gato20.png"
                  alt="El Gato - Juguetería"
                  fill
                  className="object-contain"
                  priority
                  sizes="56px"
                />
              </div>
              <div>
                <h1 className="font-kaushan text-2xl md:text-3xl text-white">El Gato</h1>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-white ml-8">
            <FilterDropdown
              id="categorias"
              label="Categorías"
              active={selectedCategory !== null}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
            >
              <OptionButton active={selectedCategory === null} onClick={() => handleCategoryChange(null)}>
                Todos
              </OptionButton>
              {categories.map(cat => (
                <OptionButton
                  key={cat.id}
                  active={selectedCategory === cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.name}
                </OptionButton>
              ))}
            </FilterDropdown>

            <FilterDropdown
              id="marcas"
              label="Marcas"
              active={selectedBrand !== null}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
            >
              <OptionButton active={selectedBrand === null} onClick={() => handleBrandChange(null)}>
                Todas
              </OptionButton>
              {brands.map(brand => (
                <OptionButton
                  key={brand.id}
                  active={selectedBrand === brand.id}
                  onClick={() => handleBrandChange(brand.id)}
                >
                  {brand.name}
                </OptionButton>
              ))}
            </FilterDropdown>

            <FilterDropdown
              id="edades"
              label="Edades"
              active={selectedAge !== null}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
            >
              <OptionButton active={selectedAge === null} onClick={() => handleAgeChange(null)}>
                Todas
              </OptionButton>
              {AGE_RANGES.map(range => (
                <OptionButton
                  key={range.id}
                  active={selectedAge === range.id}
                  onClick={() => handleAgeChange(range.id)}
                >
                  {range.label}
                </OptionButton>
              ))}
            </FilterDropdown>

            <FilterDropdown
              id="precio"
              label="Por Precio"
              active={selectedPrice !== null}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
            >
              <OptionButton active={selectedPrice === null} onClick={() => handlePriceChange(null)}>
                Todos
              </OptionButton>
              {PRICE_RANGES.map(range => (
                <OptionButton
                  key={range.id}
                  active={selectedPrice === range.id}
                  onClick={() => handlePriceChange(range.id)}
                >
                  {range.label}
                </OptionButton>
              ))}
            </FilterDropdown>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex items-center gap-6 text-[#FFFFFF] font-medium">
            <Link href="/" className="hover:text-[#1E3D2B] transition-colors">Inicio</Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Link href="/perfil" className="hover:text-[#1E3D2B] transition-colors text-white" aria-label="Mi perfil">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                  <span className="text-sm text-white font-extrabold">
                    {user?.name}
                  </span>
                </div>
                <Link href="/orders" className="hover:text-[#1E3D2B] transition-colors text-sm">
                  Mis pedidos
                </Link>
                <button
                  onClick={logout}
                  className="hover:text-[#1E3D2B] transition-colors text-sm"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="hover:text-[#1E3D2B] transition-colors">
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="bg-[#FFD54F] hover:bg-[#FFCA28] text-[#2B2D42] font-bold px-5 py-2 rounded-full transition-colors text-sm"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={toggleCart}
            className="relative flex items-center gap-2 hover:text-[#EC4899] transition-colors text-white md:text-[#FFFFFF]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* Botón hamburguesa (móvil) */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <span className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-6 bg-white transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <nav className="md:hidden border-t border-white/30 bg-[#6EBA92] px-4 pb-4 pt-2 flex flex-col gap-3 text-white font-medium">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-white/80">Filtros</span>
            <Link href="/" onClick={() => { handleNavClick(); setOpenMenu(null); }} className="py-1 hover:text-[#1E3D2B] transition-colors">
              Todas las categorías
            </Link>
            {categories.slice(0, 8).map(cat => (
              <Link
                key={cat.id}
                href={`/?category_id=${cat.id}`}
                onClick={handleNavClick}
                className="py-1 hover:text-[#1E3D2B] transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            {brands.slice(0, 6).map(brand => (
              <Link
                key={brand.id}
                href={`/?brand_id=${brand.id}`}
                onClick={handleNavClick}
                className="py-1 hover:text-[#1E3D2B] transition-colors"
              >
                {brand.name}
              </Link>
            ))}
            <Link href="/" onClick={() => { handleNavClick(); setOpenMenu(null); setSelectedCategory(null); setSelectedBrand(null); setSelectedAge(null); setSelectedPrice(null); }} className="py-1 hover:text-[#1E3D2B] transition-colors">
              Ver todos los juguetes
            </Link>
          </div>
          <div className="border-t border-white/30 pt-2 flex flex-col gap-2">
            <Link href="/" onClick={handleNavClick} className="py-2 hover:text-[#1E3D2B] transition-colors">
              Inicio
            </Link>
            {isAuthenticated ? (
              <>
                <span className="py-1 text-sm text-white font-extrabold">
                  {user?.name}
                </span>
                <Link href="/orders" onClick={handleNavClick} className="py-2 hover:text-[#1E3D2B] transition-colors">
                  Mis pedidos
                </Link>
                <Link href="/perfil" onClick={handleNavClick} className="py-2 flex items-center gap-2 hover:text-[#1E3D2B] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mi perfil
                </Link>
                <button
                  onClick={() => { logout(); handleNavClick(); }}
                  className="py-2 text-left hover:text-[#1E3D2B] transition-colors"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/login" onClick={handleNavClick} className="py-2 hover:text-[#1E3D2B] transition-colors">
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  onClick={handleNavClick}
                  className="bg-[#FFD54F] hover:bg-[#FFCA28] text-[#2B2D42] font-bold px-5 py-2.5 rounded-full transition-colors text-sm text-center"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}