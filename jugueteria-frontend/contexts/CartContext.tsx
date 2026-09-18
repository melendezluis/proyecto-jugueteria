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
const AUTH_LOGOUT_EVENT = 'elgato-auth-logout';

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

// Combina el estado local (optimista) con la respuesta del servidor sin perder
// operaciones más recientes que aún están en vuelo. Adopta el serverItemId y
// la cantidad del servidor solo si es mayor que la local.
function mergeServerItems(serverItems: ServerCartItem[]): CartItem[] {
  const current = getCartSnapshot();
  const serverByKey = new Map(
    serverItems.map(si => [getCartKey(si.product.id, si.variant?.id), si])
  );
  return current.map(item => {
    const key = getCartKey(item.product.id, item.variant?.id);
    const server = serverByKey.get(key);
    if (!server) return item;
    return {
      ...item,
      quantity: server.quantity > item.quantity ? server.quantity : item.quantity,
      serverItemId: server.id,
    };
  });
}

/* ---------- Proveedor ---------- */

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const items = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  const authRef = useRef(isAuthenticated);
  const hydratedRef = useRef(false);
  const mutationQueueRef = useRef<Promise<unknown>>(Promise.resolve());
  const serverIdsByKeyRef = useRef<Map<string, number>>(new Map());

  // Encadena cada mutación al servidor para que las respuestas nunca lleguen
  // fuera de orden ni sobreescriban operaciones más recientes.
  function enqueueMutation(task: () => Promise<unknown>) {
    const run = mutationQueueRef.current.then(task, task);
    const guarded = run.catch(() => {});
    mutationQueueRef.current = guarded;
    return guarded;
  }

  function rememberServerIds(serverItems: ServerCartItem[]) {
    serverItems.forEach(si =>
      serverIdsByKeyRef.current.set(getCartKey(si.product.id, si.variant?.id), si.id)
    );
  }

  // Sincronizar con el servidor cuando cambia la autenticación
  useEffect(() => {
    authRef.current = isAuthenticated;

    if (!isAuthenticated) {
      hydratedRef.current = false;
      serverIdsByKeyRef.current.clear();
      return;
    }

    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const localItems = getCartSnapshot();
    const request = localItems.length > 0
      ? syncCartApi(localItems.map(toPayload))
      : getCartApi();

    request
      .then(res => {
        rememberServerIds(res.data.items);
        writeCart(mapItems(res.data.items));
      })
      .catch(() => { /* conservar el carrito local si falla la sincronización */ });
  }, [isAuthenticated]);

  // Solo el logout explícito limpia el carrito local; un token inválido o un
  // fallo de backend no deben borrar el carrito del invitado.
  useEffect(() => {
    const handleLogout = () => {
      hydratedRef.current = false;
      serverIdsByKeyRef.current.clear();
      clearStoredCart();
    };
    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout);
  }, []);

  const addItem = useCallback((product: Product, quantity = 1, variant?: ProductVariant) => {
    const availableStock = variant ? variant.stock : product.stock;

    if (availableStock <= 0) {
      setIsOpen(true);
      return;
    }
    setIsOpen(true);

    const key = getCartKey(product.id, variant?.id);
    const current = getCartSnapshot();
    const existing = current.find(
      item => getCartKey(item.product.id, item.variant?.id) === key
    );
    const addQty = Math.min(quantity, availableStock);

    let next: CartItem[];
    if (existing) {
      next = current.map(item =>
        getCartKey(item.product.id, item.variant?.id) === key
          ? { ...item, quantity: Math.min(existing.quantity + addQty, availableStock) }
          : item
      );
    } else {
      next = [...current, { product, quantity: addQty, variant }];
    }
    writeCart(next);

    if (authRef.current) {
      enqueueMutation(() =>
        addCartItemApi(product.id, quantity, variant?.id)
          .then(res => {
            rememberServerIds(res.data.items);
            writeCart(mergeServerItems(res.data.items));

            // Si el ítem se eliminó localmente mientras se agregaba, se borra
            // también del servidor para no dejar huérfanos.
            const stillInCart = getCartSnapshot().some(
              item => getCartKey(item.product.id, item.variant?.id) === key
            );
            const serverItemId = serverIdsByKeyRef.current.get(key);
            if (!stillInCart && serverItemId) {
              enqueueMutation(() => removeCartItemApi(serverItemId).then(() => {}));
            }
          })
      );
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

    const serverItemId = target?.serverItemId ?? serverIdsByKeyRef.current.get(key);
    if (authRef.current && serverItemId) {
      enqueueMutation(() =>
        removeCartItemApi(serverItemId)
          .then(res => {
            rememberServerIds(res.data.items);
            writeCart(mergeServerItems(res.data.items));
          })
      );
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

    const serverItemId = target?.serverItemId ?? serverIdsByKeyRef.current.get(key);
    if (authRef.current && serverItemId) {
      enqueueMutation(() =>
        updateCartItemApi(serverItemId, quantity)
          .then(res => {
            rememberServerIds(res.data.items);
            writeCart(mergeServerItems(res.data.items));
          })
      );
    }
  }, [removeItem]);

  const clearCart = useCallback(() => {
    clearStoredCart();
    serverIdsByKeyRef.current.clear();
    if (authRef.current) {
      enqueueMutation(() => clearCartApi().then(() => {}));
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