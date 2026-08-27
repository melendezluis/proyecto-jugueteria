'use client';

import Link from 'next/link';
import Image from 'next/image'; // 👈 Agregar import de Image
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useEffect, useState } from 'react';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, toggleCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // 👈 Marcar como montado en el cliente
  }, []);

  return (
    <header className="bg-[#6EBA92] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-15 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-default">
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
            <h1 className="font-kaushan text-3xl text-white">El Gato</h1>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[#FFFFFF] font-medium">
          <Link href="/" className="hover:text-[#1E3D2B] transition-colors">Inicio</Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-white">
                Hola, <span className="font-extrabold">{user?.name}</span>
              </span>
              <Link href="/orders" className="hover:text-[#1E3D2B] transition-colors text-sm">
                Mis pedidos
              </Link>
              <Link href="/perfil" className="hover:text-[#1E3D2B] transition-colors text-sm">
                Mi perfil
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

          <button
            onClick={toggleCart}
            className="relative flex items-center gap-2 hover:text-[#EC4899] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {isMounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}