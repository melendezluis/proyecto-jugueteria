'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import PromoBar from '@/components/home/PromoBar';
import { getBrands } from '@/services/api';
import type { Product, Category, Brand } from '@/types';

interface HomeContentProps {
  initialProducts: Product[];
  categories: Category[];
  children?: React.ReactNode;
  heading?: React.ReactNode;
  showSort?: boolean;
}

type SortOption = 'az' | 'za' | 'price_asc' | 'price_desc';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'az', label: 'Alfabéticamente A-Z' },
  { id: 'za', label: 'Alfabéticamente Z-A' },
  { id: 'price_asc', label: 'Precio menor a mayor' },
  { id: 'price_desc', label: 'Precio mayor a menor' },
];

const INITIAL_VISIBLE = 8;
const LOAD_STEP = 8;

function effectivePrice(p: Product): number {
  return p.offer_price ?? p.price;
}

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

type MenuId = 'categorias' | 'marcas' | 'edades' | 'precio';

/* ------------------------------------------------------------------ */
/* Opción individual dentro de un dropdown                             */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* Dropdown de filtro                                                   */
/* ------------------------------------------------------------------ */
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
  const buttonId = `filter-btn-${id}`;
  const menuId = `filter-menu-${id}`;
  const hoverDevice = useRef<boolean>(
    typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  );

  useEffect(() => {
    if (!isOpen) return;

    // Si este dropdown no está visible (oculto por responsive, ej. la copia
    // de escritorio cuando estamos en móvil), no debe registrar listeners de
    // "click fuera" que cierren el menú del dropdown que sí está visible.
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
      onMouseEnter={() => { if (hoverDevice.current) setOpenMenu(id); }}
      onMouseLeave={() => { if (hoverDevice.current) setOpenMenu(null); }}
    >
      <button
        key={`${id}-toggle`}
        id={buttonId}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
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

      {/* Wrapper: el pt-2 actúa como "puente" invisible entre el botón y el menú.
          Al ser padding (no margin), esa franja sigue perteneciendo al div
          que tiene el onMouseEnter/onMouseLeave, así que el hover no se corta
          al bajar el mouse desde el botón hacia las opciones. */}
      <div
        key="dropdown-menu"
        className={`absolute top-full w-64 pt-2 z-50 origin-top transition-all duration-150 ${
          align === 'right' ? 'right-0' : 'left-0'
        } ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div
          id={menuId}
          role="menu"
          aria-labelledby={buttonId}
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

/* ------------------------------------------------------------------ */
/* Menú de ordenamiento "Características"                               */
/* ------------------------------------------------------------------ */
function SortMenu({ sort, onChange }: { sort: SortOption; onChange: (o: SortOption) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  return (
    <div ref={containerRef} className="relative">
      <button
        key="sort-toggle"
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
          key="sort-menu"
          role="menu"
          aria-label="Ordenar por características"
          className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
        >
          <p key="sort-label" className="px-4 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Ordenar por
          </p>
          <div key="sort-options" className="py-1">
            {SORT_OPTIONS.map(option => (
              <button
                key={option.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                className={`group w-full flex items-center justify-between gap-3 text-left px-4 py-2.5 text-sm transition-colors ${
                  sort === option.id ? 'text-[#072652] font-semibold' : 'text-gray-600 hover:text-[#072652]'
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
  );
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                 */
/* ------------------------------------------------------------------ */
export default function HomeContent({ initialProducts, categories, children, heading, showSort = false }: HomeContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('az');
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [pagination, setPagination] = useState<{ signature: string; count: number }>({
    signature: '',
    count: INITIAL_VISIBLE,
  });

  useEffect(() => {
    getBrands()
      .then(res => setBrands(res.data))
      .catch(() => {});
  }, []);

  const ageRange = AGE_RANGES.find(r => r.id === selectedAge) ?? null;
  const priceRange = PRICE_RANGES.find(r => r.id === selectedPrice) ?? null;

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredProducts = initialProducts.filter(product => {
    const matchesSearch =
      !normalizedSearch ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.brand?.name.toLowerCase().includes(normalizedSearch) ||
      product.category?.name.toLowerCase().includes(normalizedSearch);
    const matchesCategory = selectedCategory === null || product.category?.id === selectedCategory;
    const matchesBrand = selectedBrand === null || product.brand?.id === selectedBrand;
    const productAgeFrom = product.age_from ?? 0;
    const productAgeTo = product.age_to ?? 999;
    const matchesAge = !ageRange || (productAgeFrom <= ageRange.max && productAgeTo >= ageRange.min);
    const effectivePrice = product.offer_price ?? product.price;
    const matchesPrice = !priceRange || (effectivePrice >= priceRange.min && effectivePrice <= priceRange.max);
    return matchesSearch && matchesCategory && matchesBrand && matchesAge && matchesPrice;
  });

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
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
  }, [filteredProducts, sort]);

  const filterSignature = `${normalizedSearch}|${selectedCategory}|${selectedBrand}|${selectedAge}|${selectedPrice}|${sort}`;
  const visibleCount = pagination.signature === filterSignature ? pagination.count : INITIAL_VISIBLE;
  const visibleProducts = sortedProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < sortedProducts.length;

  const isSearching = normalizedSearch.length > 0;

  const activeFilterLabel =
    categories.find(c => c.id === selectedCategory)?.name ??
    brands.find(b => b.id === selectedBrand)?.name ??
    ageRange?.label ??
    priceRange?.label ??
    null;

  const hasActiveFilters =
    selectedCategory !== null || selectedBrand !== null || ageRange !== null || priceRange !== null;

  function clearAllFilters() {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedAge(null);
    setSelectedPrice(null);
  }

  return (
    <div className="min-h-screen bg-[#FFFAF5]">
      {/* BARRA SUPERIOR - Cielo pastel */}
      <div className="bg-[#072652] text-white">
        <div className="max-w-7xl mx-auto px-6 py-3">
          {/* Primera línea con navegación y buscador */}
          <div className="flex items-center justify-between relative">
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <FilterDropdown
                key="filtro-categorias"
                id="categorias"
                label="Categorías"
                active={selectedCategory !== null}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
              >
                <OptionButton active={selectedCategory === null} onClick={() => setSelectedCategory(null)}>
                  Todos
                </OptionButton>
                {categories.map(cat => (
                  <OptionButton
                    key={cat.id}
                    active={selectedCategory === cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.name}
                  </OptionButton>
                ))}
              </FilterDropdown>

              <FilterDropdown
                key="filtro-marcas"
                id="marcas"
                label="Marcas"
                active={selectedBrand !== null}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
              >
                <OptionButton active={selectedBrand === null} onClick={() => setSelectedBrand(null)}>
                  Todas
                </OptionButton>
                {brands.map(brand => (
                  <OptionButton
                    key={brand.id}
                    active={selectedBrand === brand.id}
                    onClick={() => setSelectedBrand(brand.id)}
                  >
                    {brand.name}
                  </OptionButton>
                ))}
              </FilterDropdown>

              <FilterDropdown
                key="filtro-edades"
                id="edades"
                label="Edades"
                active={selectedAge !== null}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
              >
                <OptionButton active={selectedAge === null} onClick={() => setSelectedAge(null)}>
                  Todas
                </OptionButton>
                {AGE_RANGES.map(range => (
                  <OptionButton
                    key={range.id}
                    active={selectedAge === range.id}
                    onClick={() => setSelectedAge(range.id)}
                  >
                    {range.label}
                  </OptionButton>
                ))}
              </FilterDropdown>

              <FilterDropdown
                key="filtro-precio"
                id="precio"
                label="Por Precio"
                active={selectedPrice !== null}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
              >
                <OptionButton active={selectedPrice === null} onClick={() => setSelectedPrice(null)}>
                  Todos
                </OptionButton>
                {PRICE_RANGES.map(range => (
                  <OptionButton
                    key={range.id}
                    active={selectedPrice === range.id}
                    onClick={() => setSelectedPrice(range.id)}
                  >
                    {range.label}
                  </OptionButton>
                ))}
              </FilterDropdown>
            </div>

            {/* Buscador */}
            <div className="flex items-center gap-3">
              <p key="search-hint" className="text-sm text-white hidden lg:block">¿Qué juguete estás buscando?</p>
              <input
                key="search-input"
                type="text"
                placeholder="Buscar juguetes, marca o categorias"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-1.5 border border-white/40 rounded-full focus:outline-none focus:border-[#FFD54F] bg-white text-[#2B2D42] placeholder:text-gray-400 text-sm w-56 lg:w-72"
              />
            </div>
          </div>

          {/* Segunda línea - Promociones rápidas */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/30 text-sm">
            <div className="flex items-center gap-5 overflow-x-auto pb-1 flex-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <PromoBar />
            </div>
          </div>

          {/* Tercera línea - Filtros (solo móvil) */}
          <div className="md:hidden mt-3 pt-3 border-t border-white/30">
            <button
              key="mobile-filters-toggle"
              onClick={() => setMobileFiltersOpen(o => !o)}
              aria-expanded={mobileFiltersOpen}
              className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-colors ${
                mobileFiltersOpen || hasActiveFilters
                  ? 'bg-[#FFD54F] text-[#2B2D42]'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <svg key="filtros-icon" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filtros
              {hasActiveFilters && <span key="filtros-dot" className="bg-pink-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">!</span>}
            </button>

            {mobileFiltersOpen && (
              <div key="mobile-filters" className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-4 text-white font-medium pb-1">
                <FilterDropdown
                  key="mob-filtro-categorias"
                  id="categorias"
                  label="Categorías"
                  active={selectedCategory !== null}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                >
                  <OptionButton active={selectedCategory === null} onClick={() => setSelectedCategory(null)}>
                    Todos
                  </OptionButton>
                  {categories.map(cat => (
                    <OptionButton
                      key={cat.id}
                      active={selectedCategory === cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.name}
                    </OptionButton>
                  ))}
                </FilterDropdown>

                <FilterDropdown
                  key="mob-filtro-marcas"
                  id="marcas"
                  label="Marcas"
                  active={selectedBrand !== null}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                >
                  <OptionButton active={selectedBrand === null} onClick={() => setSelectedBrand(null)}>
                    Todas
                  </OptionButton>
                  {brands.map(brand => (
                    <OptionButton
                      key={brand.id}
                      active={selectedBrand === brand.id}
                      onClick={() => setSelectedBrand(brand.id)}
                    >
                      {brand.name}
                    </OptionButton>
                  ))}
                </FilterDropdown>

                <FilterDropdown
                  key="mob-filtro-edades"
                  id="edades"
                  label="Edades"
                  active={selectedAge !== null}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                >
                  <OptionButton active={selectedAge === null} onClick={() => setSelectedAge(null)}>
                    Todas
                  </OptionButton>
                  {AGE_RANGES.map(range => (
                    <OptionButton
                      key={range.id}
                      active={selectedAge === range.id}
                      onClick={() => setSelectedAge(range.id)}
                    >
                      {range.label}
                    </OptionButton>
                  ))}
                </FilterDropdown>

                <FilterDropdown
                  key="mob-filtro-precio"
                  id="precio"
                  label="Por Precio"
                  active={selectedPrice !== null}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                >
                  <OptionButton active={selectedPrice === null} onClick={() => setSelectedPrice(null)}>
                    Todos
                  </OptionButton>
                  {PRICE_RANGES.map(range => (
                    <OptionButton
                      key={range.id}
                      active={selectedPrice === range.id}
                      onClick={() => setSelectedPrice(range.id)}
                    >
                      {range.label}
                    </OptionButton>
                  ))}
                </FilterDropdown>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {!isSearching && !hasActiveFilters && <div className="space-y-12">{children}</div>}

        <div className="flex flex-wrap items-center justify-between gap-3 mt-8 mb-6 md:mt-12 md:mb-8">
          <div key="heading-block" id="productos">
            {isSearching ? (
              <h2 className="text-2xl md:text-4xl font-bold text-[#2B2D42] font-fredoka tracking-wide">
                {`Resultados para "${searchTerm.trim()}"`}
              </h2>
            ) : activeFilterLabel ? (
              <h2 className="text-2xl md:text-4xl font-bold text-[#2B2D42] font-fredoka tracking-wide">
                {activeFilterLabel}
              </h2>
            ) : heading ? (
              heading
            ) : (
              <h2 className="text-2xl md:text-4xl font-bold text-[#2B2D42] font-fredoka tracking-wide">
                Todos los productos
              </h2>
            )}
          </div>
          <div key="count-area" className="flex flex-wrap items-center gap-4">
            {showSort && <SortMenu key="sort" sort={sort} onChange={setSort} />}
            {hasActiveFilters && (
              <button
  key="show-all"
  onClick={() => {
    clearAllFilters();
    setSearchTerm('');
  }}
  className="group relative px-6 py-2.5 text-sm font-medium text-[#7F9E9F] hover:text-white transition-colors duration-300 rounded-full border-2 border-[#7F9E9F] hover:border-transparent bg-transparent overflow-hidden"
>
  <span key="show-all-label" className="relative z-10 flex items-center gap-2">
    <svg key="show-all-icon" className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
    Mostrar Todo
  </span>
  <span key="show-all-bg" className="absolute inset-0 bg-gradient-to-r from-[#7F9E9F] to-[#5F9EA0] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
</button>
            )}
          </div>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="relative text-center py-16 px-6 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
  
  {/* Fondo decorativo sutil (burbujas de colores) */}
  <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
    <div className="absolute top-10 left-10 w-32 h-32 bg-[#FF5D73] rounded-full blur-3xl" />
    <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#2FB0E8] rounded-full blur-3xl" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FFA23E] rounded-full blur-3xl" />
  </div>

  <div className="relative z-10 flex flex-col items-center">
    
    {/* Icono ilustrativo */}
    <div className="w-24 h-24 mb-6 rounded-full bg-gray-50 flex items-center justify-center border-4 border-white shadow-inner">
      {isSearching ? (
        // Icono de lupa con carita triste
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#6EBA92]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
          <path d="M8 11h.01" />
          <path d="M14 11h.01" />
          <path d="M9.5 15.5c.5-1 1.5-1.5 2.5-1.5s2 .5 2.5 1.5" />
        </svg>
      ) : (
        // Icono de caja de juguetes vacía
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
          <path d="M8 10.5v-3" />
        </svg>
      )}
    </div>

    {/* Título y descripción */}
    {isSearching ? (
      <>
        <h3 className="text-3xl text-[#2B2D42] font-fredoka font-bold">
          ¡Ups! No encontramos «{searchTerm.trim()}»
        </h3>
        <p className="text-gray-500 mt-3 font-nunito max-w-md mx-auto text-lg">
          Parece que ese juguete se escondió muy bien. Revisa la ortografía o intenta con otra palabra mágica.
        </p>
      </>
    ) : (
      <>
        <h3 className="text-3xl text-[#2B2D42] font-fredoka font-bold">
          No hay juguetes por aquí
        </h3>
        <p className="text-gray-500 mt-3 font-nunito max-w-md mx-auto text-lg">
          Parece que los estantes están vacíos con estos filtros. ¡Prueba quitando alguno para ver más opciones!
        </p>
      </>
    )}

    {/* Botón de acción principal */}
    <button
      onClick={() => {
        setSearchTerm('');
        clearAllFilters();
      }}
      className="mt-8 group relative inline-flex items-center gap-2 px-8 py-3.5 bg-[#6EBA92] hover:bg-[#4F916C] text-white rounded-full font-bold text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Icono de destellos (Sparkles) en SVG inline */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-5 h-5 group-hover:rotate-12 transition-transform" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
      </svg>
      Ver todos los juguetes
    </button>
  </div>
</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {visibleProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {(hasMoreProducts || visibleCount > INITIAL_VISIBLE) && (
              <div className="text-center mt-12">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {visibleCount > INITIAL_VISIBLE && (
                    <button
                      onClick={() =>
                        setPagination({
                          signature: filterSignature,
                          count: Math.max(INITIAL_VISIBLE, visibleCount - LOAD_STEP),
                        })
                      }
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
                  )}

                  {hasMoreProducts && (
                    <button
                      onClick={() => setPagination({ signature: filterSignature, count: visibleCount + LOAD_STEP })}
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
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}