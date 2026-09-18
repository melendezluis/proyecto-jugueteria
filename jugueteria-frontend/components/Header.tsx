'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, toggleCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <header className="bg-[#6EBA92] shadow-sm fixed top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-15 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer">
          <Link href="/" className="flex items-center gap-3" aria-label="Ir al inicio">
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
              <h1 className="font-kaushan text-2xl md:text-3xl text-white">El Gato</h1>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex items-center gap-6 text-[#FFFFFF] font-medium">
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
          </div>

          <button
            onClick={toggleCart}
            className="relative flex items-center gap-2 hover:text-[#EC4899] transition-colors text-white md:text-[#FFFFFF]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* Botón hamburguesa (móvil) */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <span className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-6 bg-white transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <nav className="md:hidden border-t border-white/30 bg-[#6EBA92] px-4 pb-4 pt-2 flex flex-col gap-3 text-white font-medium">
          <Link href="/" onClick={handleNavClick} className="py-2 hover:text-[#1E3D2B] transition-colors">
            Inicio
          </Link>
          {isAuthenticated ? (
            <>
              <span className="py-1 text-sm text-white/80">
                Hola, <span className="font-extrabold">{user?.name}</span>
              </span>
              <Link href="/orders" onClick={handleNavClick} className="py-2 hover:text-[#1E3D2B] transition-colors">
                Mis pedidos
              </Link>
              <Link href="/perfil" onClick={handleNavClick} className="py-2 hover:text-[#1E3D2B] transition-colors">
                Mi perfil
              </Link>
              <button
                onClick={() => { logout(); handleNavClick(); }}
                className="py-2 text-left hover:text-[#1E3D2B] transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={handleNavClick} className="py-2 hover:text-[#1E3D2B] transition-colors">
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                onClick={handleNavClick}
                className="bg-[#FFD54F] hover:bg-[#FFCA28] text-[#2B2D42] font-bold px-5 py-2.5 rounded-full transition-colors text-sm text-center"
              >
                Registrarse
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}