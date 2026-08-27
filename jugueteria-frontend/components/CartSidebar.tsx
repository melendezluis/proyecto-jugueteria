'use client';

import { useCart } from '@/contexts/CartContext';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

const SHIPPING_COST = 10;

type IconProps = { className?: string };

function BagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
      />
    </svg>
  );
}

function TrashIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

function LockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

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

  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="cart-overlay absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <div
        ref={sidebarRef}
        className="cart-panel absolute right-0 top-0 h-full w-full max-w-lg bg-gray-50 shadow-2xl flex flex-col"
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between p-5 sm:p-6 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E7EBFE] flex items-center justify-center">
              <BagIcon className="w-5 h-5 text-[#287FF0]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">Tu carrito</h2>
              <p className="text-xs text-gray-400">
                {totalUnits} {totalUnits === 1 ? 'artículo' : 'artículos'}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Lista de productos */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center text-5xl mb-5">
                🛒
              </div>
              <p className="text-xl font-bold text-gray-800">Tu carrito está vacío</p>
              <p className="text-sm text-gray-500 mt-2 mb-7">Agrega juguetes para empezar a comprar.</p>
              <Link
                href="/"
                onClick={closeCart}
                className="inline-block bg-[#287FF0] hover:bg-[#1B66D0] text-white font-semibold px-8 py-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-200"
              >
                Ver juguetes
              </Link>
            </div>
          ) : (
            items.map(item => {
              const itemPrice = item.product.offer_price ?? item.product.price;
              const hasOffer = item.product.offer_price !== null && item.product.offer_price < item.product.price;
              return (
                <div
                  key={`${item.product.id}-${item.variant?.id ?? ''}`}
                  className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
                >
                  <div className="relative w-20 h-20 bg-gradient-to-br from-sky-100 to-blue-200 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                    🧸
                    <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 bg-[#FFD23F] text-gray-900 text-[11px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{item.product.name}</h3>
                    {(item.variant?.color || item.variant?.size) && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {[item.variant?.color && `Color: ${item.variant.color}`, item.variant?.size && `Talla: ${item.variant.size}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-bold text-[#287FF0]">S/ {(itemPrice * item.quantity).toFixed(2)}</span>
                      {hasOffer && (
                        <span className="text-xs text-gray-400 line-through">S/ {(item.product.price * item.quantity).toFixed(2)}</span>
                      )}
                      <span className="text-[11px] text-gray-400">· S/ {itemPrice.toFixed(2)} c/u</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <button
                      onClick={() => removeItem(item.product.id, item.variant?.id)}
                      aria-label={`Eliminar ${item.product.name}`}
                      className="p-2 -mr-1 -mt-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <TrashIcon className="w-[18px] h-[18px]" />
                    </button>
                    <div className="flex items-center gap-1 border border-gray-200 rounded-full bg-white p-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                        aria-label="Disminuir cantidad"
                        className="w-7 h-7 rounded-full hover:bg-blue-50 hover:text-[#287FF0] transition-colors text-gray-600 font-bold flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="min-w-[1.75rem] text-center font-bold text-sm text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                        aria-label="Aumentar cantidad"
                        className="w-7 h-7 rounded-full hover:bg-blue-50 hover:text-[#287FF0] transition-colors text-gray-600 font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Resumen y pago */}
        {items.length > 0 && (
          <div className="bg-white border-t border-gray-100 p-5 sm:p-6 space-y-3">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">S/ {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span className="font-semibold text-gray-800">S/ {SHIPPING_COST.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#E7EBFE] rounded-2xl px-4 py-3">
              <span className="font-bold text-gray-800">Total</span>
              <span className="text-2xl font-extrabold text-[#1B66D0]">
                S/ {(totalPrice + SHIPPING_COST).toFixed(2)}
              </span>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="mt-1 w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#C4785C] to-[#A85D42] hover:from-[#B56A4E] hover:to-[#9A5238] text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] text-lg shadow-lg shadow-orange-200 btn-shimmer"
            >
              <LockIcon className="w-5 h-5" />
              Ir a pagar
            </Link>

            <Link
              href="/"
              onClick={closeCart}
              className="block text-center text-gray-500 hover:text-[#C4785C] text-sm font-medium pt-1 transition-colors"
            >
              ← Seguir comprando
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
