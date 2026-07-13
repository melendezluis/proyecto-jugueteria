'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { getProducts, getCategories } from '@/services/api';
import type { Product, Category } from '@/types';
import Image from 'next/image';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData.data);
        setCategories(categoriesData.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === null || product.category?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE4B5] to-[#FFDAB9]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 👇 LOGO O TÍTULO PRINCIPAL CON FUENTE ELEGANTE */}
        
          <div className="flex justify-center items-center gap-4 w-full mb-6"> {/* 👈 Contenedor flex con alineación vertical */}
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-orange-500 bg-orange-50 flex-shrink-0">
                <Image
                  src="/images/gato7.png"
                  alt="El Gato - Juguetería"
                  fill
                  className="object-contain"
                  priority
                  />
            </div>
          <div>
            <h1 className="text-7xl font-bold text-orange-600">El Gato</h1>
            <p className="text-sm text-gray-900 -mt-1">Juguetes que hacen felíz a niños y adultos</p>
          </div>
      </div>
        

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Buscar juguetes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 border border-gray-200 rounded-full focus:outline-none focus:border-orange-500 text-lg text-gray-800 placeholder:text-gray-400 font-inter"
            />
          </div>
        </div>

        <div className="flex gap-10">
          <div className="w-64 flex-shrink-0">
            <h3 className="font-semibold text-xl mb-5 text-gray-800 font-playfair">
              Categorías
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-5 py-3 rounded-2xl font-medium transition-all font-inter ${
                  selectedCategory === null 
                    ? 'bg-orange-600 text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                Todas las categorías
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-5 py-3 rounded-2xl font-medium transition-all font-inter ${
                    selectedCategory === cat.id 
                      ? 'bg-orange-600 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
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

            {loading ? (
              <div className="text-center py-20">
                <p className="text-2xl text-gray-500 animate-pulse font-inter">
                  Cargando juguetes...
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
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
      </div>
    </div>
  );
}