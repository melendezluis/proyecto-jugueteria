'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem, Product, ProductVariant } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (productId: number, variantId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getCartKey(productId: number, variantId?: number): string {
  return variantId ? `${productId}-${variantId}` : `${productId}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) setItems(JSON.parse(saved));
    } catch { }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem('cart', JSON.stringify(items));
  }, [items, loaded]);

  const addItem = useCallback((product: Product, quantity = 1, variant?: ProductVariant) => {
    setItems(prev => {
      const key = getCartKey(product.id, variant?.id);
      const existing = prev.find(
        item => getCartKey(item.product.id, item.variant?.id) === key
      );
      if (existing) {
        return prev.map(item =>
          getCartKey(item.product.id, item.variant?.id) === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, variant }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: number, variantId?: number) => {
    setItems(prev =>
      prev.filter(item => getCartKey(item.product.id, item.variant?.id) !== getCartKey(productId, variantId))
    );
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number, variantId?: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        getCartKey(item.product.id, item.variant?.id) === getCartKey(productId, variantId)
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.product.offer_price ?? item.product.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        toggleCart: () => setIsOpen(prev => !prev),
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
