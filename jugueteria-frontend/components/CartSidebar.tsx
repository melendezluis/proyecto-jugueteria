'use client';

import { useCart } from '@/contexts/CartContext';
import { useEffect, useRef } from 'react';

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCart();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        closeCart();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50" />
      <div
        ref={sidebarRef}
        className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Carrito ({items.length} {items.length === 1 ? 'producto' : 'productos'})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <span className="text-6xl block mb-4">🛒</span>
              <p className="text-xl">Tu carrito está vacío</p>
              <p className="text-sm mt-2">Agrega productos para empezar a comprar</p>
            </div>
          ) : (
            items.map(item => {
              const itemPrice = item.product.offer_price ?? item.product.price;
              return (
                <div key={`${item.product.id}-${item.variant?.id ?? ''}`} className="flex gap-4 bg-gray-50 rounded-2xl p-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                    🧸
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{item.product.name}</h3>
                    {item.variant?.color && (
                      <p className="text-sm text-gray-500">Color: {item.variant.color}</p>
                    )}
                    {item.variant?.size && (
                      <p className="text-sm text-gray-500">Talla: {item.variant.size}</p>
                    )}
                    <p className="text-orange-600 font-bold mt-1">
                      S/ {(itemPrice * item.quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                          className="px-3 py-1 hover:bg-gray-100 transition-colors text-gray-700 font-bold"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 font-semibold min-w-[2rem] text-center text-gray-800 border-x border-gray-300">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                          className="px-3 py-1 hover:bg-gray-100 transition-colors text-gray-700 font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.variant?.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium ml-auto"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-gray-800">Total</span>
              <span className="font-bold text-orange-600 text-2xl">S/ {totalPrice.toFixed(2)}</span>
            </div>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-2xl transition-all text-lg">
              Ir a pagar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
