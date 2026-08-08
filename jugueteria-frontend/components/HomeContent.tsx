'use client';

import { useState, useRef, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import Image from 'next/image';
import type { Product, Category } from '@/types';

interface HomeContentProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function HomeContent({ initialProducts, categories }: HomeContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredProducts = initialProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === null || product.category?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* BARRA AZUL SUPERIOR - Estilo Caramba */}
      <div className="bg-[#ECCAFC] text-black">
        <div className="max-w-7xl mx-auto px-6 py-3">
          {/* Primera línea con navegación y buscador */}
          <div className="flex items-center justify-between relative">
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              {/* Categorías con menú desplegable al hacer hover */}
              <div 
                ref={dropdownRef}
                className="relative"
                onMouseEnter={() => setIsCategoriesOpen(true)}
                onMouseLeave={() => {
                  // No cerramos inmediatamente, damos tiempo para que el mouse llegue al menú
                  setTimeout(() => {
                    // Verificamos si el mouse está sobre el menú
                    const hoveredElement = document.querySelector('.categories-dropdown:hover');
                    if (!hoveredElement) {
                      setIsCategoriesOpen(false);
                    }
                  }, 100);
                }}
              >
                <span className="hover:text-blue-700 cursor-pointer transition-colors flex items-center gap-1 text-xl">
                  Categorías
                  <span className="text-xs">
                    {isCategoriesOpen ? '▲' : '▼'}
                  </span>
                </span>
                
                {/* Menú desplegable de categorías */}
                {isCategoriesOpen && (
                  <div 
                    className="categories-dropdown absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50"
                    onMouseEnter={() => setIsCategoriesOpen(true)}
                    onMouseLeave={() => setIsCategoriesOpen(false)}
                  >
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setIsCategoriesOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                    >
                      Todos
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setIsCategoriesOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <span className="hover:text-blue-700 cursor-pointer transition-colors text-xl">Marcas</span>
              <span className="hover:text-blue-700 cursor-pointer transition-colors text-xl">Edades</span>
              <span className="hover:text-blue-700 cursor-pointer transition-colors text-xl">Por Precio</span>
            </div>

            {/* Buscador movido aquí - a la derecha de Por Precio */}
            <div className="flex items-center gap-3">
              <p className="text-sm text-black-50 hidden lg:block">¿Qué juguete estás buscando?</p>
              <input
                type="text"
                placeholder="Buscar juguetes, marca o categorias"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-1.5 border border-black/30 rounded-full focus:outline-none focus:border-black bg-white/10 text-black placeholder:text-gray text-sm w-56 lg:w-72"
              />
            </div>
          </div>

          {/* Segunda línea - Promociones rápidas */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-400/30 text-sm">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 hover:text-blue-200 cursor-pointer transition-colors">
                <span>📦</span> RECIÉN LLEGADOS
              </span>
              <span className="flex items-center gap-2 hover:text-blue-200 cursor-pointer transition-colors">
                <span>🚀</span> ENVÍO EXPRESS
              </span>
              <span className="flex items-center gap-2 hover:text-blue-200 cursor-pointer transition-colors">
                <span>🎮</span> PACK DE JUEGOS
              </span>
              <span className="flex items-center gap-2 hover:text-blue-200 cursor-pointer transition-colors">
                <span>🎀</span> BABY SHOWER
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL - SIN EL SIDEBAR DE CATEGORÍAS */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 font-playfair tracking-wide">
            {selectedCategory
              ? categories.find(c => c.id === selectedCategory)?.name
              : 'Todos los productos'}
          </h2>
          <p className="text-gray-500 text-lg font-inter">
            {filteredProducts.length} productos
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">🔍</span>
            <p className="text-2xl text-gray-500 font-playfair">
              No se encontraron productos
            </p>
            <p className="text-gray-400 mt-2 font-inter">
              Intenta con otros filtros o términos de búsqueda
            </p>
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