'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { getImageUrl } from '@/services/api';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const hasOffer = product.offer_price !== null && product.offer_price < product.price;
  const mainImage = product.images.find(img => img.is_main)?.image_path
    ?? product.images[0]?.image_path
    ?? null;

  return (
    <div className="bg-[#E7EBFE] rounded-3xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="h-64 bg-gradient-to-br from-sky-400 to-blue-600 relative overflow-hidden">
          <span className="absolute inset-0 flex items-center justify-center text-8xl select-none">🧸</span>
          {mainImage && (
            <img
              src={getImageUrl(mainImage) ?? undefined}
              alt={product.name}
              className="relative w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          )}
          {hasOffer && (
            <span className="absolute top-3 left-3 z-10 bg-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              Oferta
            </span>
          )}
          {product.is_featured && !hasOffer && (
            <span className="absolute top-3 left-3 z-10 bg-[#FFD23F] text-gray-900 text-sm font-bold px-3 py-1 rounded-full">
              Destacado
            </span>
          )}
        </div>
      </Link>
      <div className="p-6 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-xl text-gray-800 mb-2 line-clamp-2 h-14 hover:text-blue-900 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mb-3">
          {product.category?.name}
        </p>
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-5">
            {hasOffer ? (
              <>
                <p className="text-3xl font-bold text-pink-600">
                  S/ {product.offer_price!.toFixed(2)}
                </p>
                <p className="text-lg text-gray-400 line-through">
                  S/ {product.price.toFixed(2)}
                </p>
              </>
            ) : (
              <p className="text-3xl font-bold text-gray-900">
                S/ {product.price.toFixed(2)}
              </p>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#C4785C] hover:bg-[#B56A4E] text-white font-semibold py-4 rounded-2xl transition-all active:scale-95 shadow-md shadow-[#C4785C]/30 btn-shimmer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
