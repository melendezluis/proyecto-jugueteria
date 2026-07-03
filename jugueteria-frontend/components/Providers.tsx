'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/Header';
import CartSidebar from '@/components/CartSidebar';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Header />
        <main className="flex-1">{children}</main>
        <CartSidebar />
      </CartProvider>
    </AuthProvider>
  );
}
