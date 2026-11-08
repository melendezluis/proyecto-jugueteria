'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import CookieConsent from '@/components/CookieConsent';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Header />
        <main className="flex-1 pt-24">{children}</main>
        <Footer />
        <CartSidebar />
        <CookieConsent />
      </CartProvider>
    </AuthProvider>
  );
}
