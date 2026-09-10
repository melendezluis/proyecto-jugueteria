'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { CartItem, Product, ProductVariant } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  addCartItemApi,
  clearCartApi,
  getCartApi,
  removeCartItemApi,
  syncCartApi,
  updateCartItemApi,
  type ServerCartItem,
} from '@/services/api';

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

function toPayload(item: CartItem) {
  return {
    product_id: item.product.id,
    quantity: item.quantity,
    variant_id: item.variant?.id,
  };
}

function mapItems(serverItems: ServerCartItem[]): CartItem[] {
  return serverItems.map(item => ({
    product: item.product,
    quantity: item.quantity,
    variant: item.variant ?? undefined,
    serverItemId: item.id,
  }));
}

/* ---------- Almacén externo: localStorage como fuente única del carrito ---------- */

const CART_STORAGE_KEY = 'cart';
const CART_EVENT = 'elgato-cart-updated';

let cachedCart: CartItem[] = [];
let cachedRaw: string | null = null;

function getCartSnapshot(): CartItem[] {
  if (typeof window === 'undefined') return cachedCart;
  const raw = localStorage.getItem(CART_STORAGE_KEY) ?? '';
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedCart = raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      cachedCart = [];
    }
  }
  return cachedCart;
}

function subscribeToCart(callback: () => void) {
  window.addEventListener(CART_EVENT, callback);
  return () => window.removeEventListener(CART_EVENT, callback);
}

const getServerSnapshot = () => cachedCart;

function writeCart(next: CartItem[]) {
  cachedRaw = JSON.stringify(next);
  cachedCart = next;
  localStorage.setItem(CART_STORAGE_KEY, cachedRaw);
  window.dispatchEvent(new Event(CART_EVENT));
}

function clearStoredCart() {
  cachedRaw = null;
  cachedCart = [];
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch { /* ignore */ }
  window.dispatchEvent(new Event(CART_EVENT));
}

/* ---------- Proveedor ---------- */

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const items = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  const authRef = useRef(isAuthenticated);
  const hydratedRef = useRef(false);

  // Sincronizar con el servidor cuando cambia la autenticación
  useEffect(() => {
    const prevAuth = authRef.current;
    authRef.current = isAuthenticated;

    if (!isAuthenticated) {
      hydratedRef.current = false;
      if (prevAuth) {
        clearStoredCart();
      }
      return;
    }

    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const localItems = getCartSnapshot();
    const request = localItems.length > 0
      ? syncCartApi(localItems.map(toPayload))
      : getCartApi();

    request
      .then(res => writeCart(mapItems(res.data.items)))
      .catch(() => { /* conservar el carrito local si falla la sincronización */ });
  }, [isAuthenticated]);

  const addItem = useCallback((product: Product, quantity = 1, variant?: ProductVariant) => {
    const availableStock = variant ? variant.stock : product.stock;

    if (availableStock <= 0) {
      setIsOpen(true);
      return;
    }
    setIsOpen(true);

    const applyLocal = () => {
      const current = getCartSnapshot();
      const key = getCartKey(product.id, variant?.id);
      const existing = current.find(
        item => getCartKey(item.product.id, item.variant?.id) === key
      );
      let next: CartItem[];
      if (existing) {
        next = current.map(item =>
          getCartKey(item.product.id, item.variant?.id) === key
            ? { ...item, quantity: Math.min(existing.quantity + quantity, availableStock) }
            : item
        );
      } else {
        next = [...current, { product, quantity: Math.min(quantity, availableStock), variant }];
      }
      writeCart(next);
    };

    if (authRef.current) {
      addCartItemApi(product.id, quantity, variant?.id)
        .then(res => writeCart(mapItems(res.data.items)))
        .catch(applyLocal);
    } else {
      applyLocal();
    }
  }, []);

  const removeItem = useCallback((productId: number, variantId?: number) => {
    const key = getCartKey(productId, variantId);
    const current = getCartSnapshot();
    const target = current.find(
      item => getCartKey(item.product.id, item.variant?.id) === key
    );

    writeCart(current.filter(
      item => getCartKey(item.product.id, item.variant?.id) !== key
    ));

    if (authRef.current && target?.serverItemId) {
      removeCartItemApi(target.serverItemId)
        .then(res => writeCart(mapItems(res.data.items)))
        .catch(() => {});
    }
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number, variantId?: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }

    const key = getCartKey(productId, variantId);
    const current = getCartSnapshot();
    const target = current.find(
      item => getCartKey(item.product.id, item.variant?.id) === key
    );

    writeCart(current.map(item =>
      getCartKey(item.product.id, item.variant?.id) === key
        ? { ...item, quantity }
        : item
    ));

    if (authRef.current && target?.serverItemId) {
      updateCartItemApi(target.serverItemId, quantity)
        .then(res => writeCart(mapItems(res.data.items)))
        .catch(() => {});
    }
  }, [removeItem]);

  const clearCart = useCallback(() => {
    clearStoredCart();
    if (authRef.current) {
      clearCartApi().catch(() => {});
    }
  }, []);

  // Calcular totales solo con items disponibles
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) =>
      sum +
      ((item.product.offer_price ?? item.product.price) + (item.variant?.price_extra ?? 0)) *
        item.quantity,
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