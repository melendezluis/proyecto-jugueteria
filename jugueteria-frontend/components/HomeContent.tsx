'use client';

import { useState, useRef, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { getBrands } from '@/services/api';
import type { Product, Category, Brand } from '@/types';

interface HomeContentProps {
  initialProducts: Product[];
  categories: Category[];
  children?: React.ReactNode;
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

  useEffect(() => {
    if (!isOpen) return;

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
      onMouseEnter={() => setOpenMenu(id)}
      onMouseLeave={() => setOpenMenu(null)}
    >
      <button
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
          <div className="max-h-72 overflow-y-auto py-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                 */
/* ------------------------------------------------------------------ */
export default function HomeContent({ initialProducts, categories, children }: HomeContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);

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
              <p className="text-sm text-white hidden lg:block">¿Qué juguete estás buscando?</p>
              <input
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
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 bg-[#FFC8DD] text-[#2B2D42] font-semibold px-3 py-1 rounded-full cursor-pointer hover:bg-[#FFB3D1] transition-colors">
                <span>📦</span> RECIÉN LLEGADOS
              </span>
              <span className="flex items-center gap-2 bg-[#B7E4C7] text-[#2B2D42] font-semibold px-3 py-1 rounded-full cursor-pointer hover:bg-[#A3DBB8] transition-colors">
                <span>🚀</span> ENVÍO EXPRESS
              </span>
              <span className="flex items-center gap-2 bg-[#BDE0FE] text-[#2B2D42] font-semibold px-3 py-1 rounded-full cursor-pointer hover:bg-[#A9D5FD] transition-colors">
                <span>🎮</span> PACK DE JUEGOS
              </span>
              <span className="hidden lg:flex items-center gap-2 bg-[#E4C1F9] text-[#2B2D42] font-semibold px-3 py-1 rounded-full cursor-pointer hover:bg-[#DAACF6] transition-colors">
                <span>🎀</span> BABY SHOWER
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {!isSearching && !hasActiveFilters && <div className="space-y-12">{children}</div>}

        <div className="flex justify-between items-center mt-12 mb-8">
          <h2 className="text-4xl font-bold text-[#2B2D42] font-fredoka tracking-wide">
            {isSearching
              ? `Resultados para "${searchTerm.trim()}"`
              : activeFilterLabel ?? 'Todos los productos'}
          </h2>
          <div className="flex items-center gap-4">
            {hasActiveFilters && (
              <button
  onClick={() => {
    clearAllFilters();
    setSearchTerm('');
  }}
  className="group relative px-6 py-2.5 text-sm font-medium text-[#7F9E9F] hover:text-white transition-colors duration-300 rounded-full border-2 border-[#7F9E9F] hover:border-transparent bg-transparent overflow-hidden"
>
  <span className="relative z-10 flex items-center gap-2">
    <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
    Mostrar Todo
  </span>
  <span className="absolute inset-0 bg-gradient-to-r from-[#7F9E9F] to-[#5F9EA0] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
</button>
            )}
            <p className="text-gray-500 text-lg font-nunito">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            {isSearching ? (
              <>
                <p className="text-2xl text-[#2B2D42] font-fredoka font-semibold">
                  Ups... no encontramos «{searchTerm.trim()}»
                </p>
                <p className="text-gray-500 mt-3 font-nunito max-w-md mx-auto">
                  No hay juguetes que coincidan con tu búsqueda. Revisa la ortografía o prueba con
                  otras palabras como «peluche», «auto» o «bloques».
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl text-gray-500 font-fredoka">
                  No se encontraron productos
                </p>
                <p className="text-gray-400 mt-2 font-nunito">
                  Intenta con otros filtros o términos de búsqueda
                </p>
              </>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                clearAllFilters();
              }}
              className="mt-6 px-6 py-2.5 bg-[#FF8A65] hover:bg-[#E67A55] text-white rounded-full font-medium transition-colors"
            >
              Ver todos los juguetes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}