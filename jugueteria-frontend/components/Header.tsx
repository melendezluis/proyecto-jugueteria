'use client';

import Link from 'next/link';
import Image from 'next/image'; // 👈 Agregar import de Image
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, toggleCart } = useCart();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-orange-500 bg-orange-50 flex-shrink-0">{/* 👈 Ajusta el tamaño según tu logo */}
            <Image
              src="/images/gato7.png" // 👈 Cambia por el nombre de tu logo
              alt="El Gato - Juguetería"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-orange-600">El Gato</h1>
            <p className="text-sm text-gray-500 -mt-1">Juguetes que hacen feliz</p>
          </div>
        </Link>

        <div className="flex items-center gap-6 text-gray-700 font-medium">
          <Link href="/" className="hover:text-orange-600">Inicio</Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Hola, <span className="text-orange-600 font-semibold">{user?.name}</span>
              </span>
              <button
                onClick={logout}
                className="hover:text-orange-600 transition-colors text-sm"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:text-orange-600 transition-colors">
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-full transition-colors text-sm"
              >
                Registrarse
              </Link>
            </div>
          )}

          <button
            onClick={toggleCart}
            className="relative flex items-center gap-2 hover:text-orange-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}