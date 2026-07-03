'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const hasOffer = product.offer_price !== null && product.offer_price < product.price;

  return (
    <div className="bg-white rounded-3xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="h-64 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform relative">
          <span>🧸</span>
          {hasOffer && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              Oferta
            </span>
          )}
          {product.is_featured && !hasOffer && (
            <span className="absolute top-3 left-3 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              Destacado
            </span>
          )}
        </div>
      </Link>
      <div className="p-6 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-xl text-gray-800 mb-2 line-clamp-2 h-14 hover:text-orange-600 transition-colors">
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
                <p className="text-3xl font-bold text-orange-600">
                  S/ {product.offer_price!.toFixed(2)}
                </p>
                <p className="text-lg text-gray-400 line-through">
                  S/ {product.price.toFixed(2)}
                </p>
              </>
            ) : (
              <p className="text-3xl font-bold text-orange-600">
                S/ {product.price.toFixed(2)}
              </p>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-2xl transition-all active:scale-95"
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
