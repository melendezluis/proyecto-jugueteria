import type {
  ProductsResponse,
  SingleProductResponse,
  CategoriesResponse,
  BrandsResponse,
  OrderResponse,
  OrdersResponse,
  Product,
  ProductVariant,
} from '@/types';

const ENV_API_URL = process.env.NEXT_PUBLIC_API_URL || '/api-proxy';

// Productos por página en la grilla pública del catálogo.
export const GRID_PAGE_SIZE = 12;

function isRelativeUrl(url: string): boolean {
  return url.startsWith('/');
}

function getApiBase(): string {
  if (!isRelativeUrl(ENV_API_URL)) return ENV_API_URL;
  return typeof window === 'undefined' ? 'http://localhost:8000/api' : ENV_API_URL;
}

function getAssetsBase(): string {
  if (isRelativeUrl(ENV_API_URL)) return '';
  return ENV_API_URL.replace(/\/api\/?$/, '');
}

export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = getAssetsBase();
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

const REQUEST_TIMEOUT_MS = 20000;

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const externalSignal = options?.signal;
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', onExternalAbort);
    }
  }

  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${getApiBase()}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options?.headers as Record<string, string> },
      signal: controller.signal,
    });
  } catch (err) {
    if (controller.signal.aborted && !externalSignal?.aborted) {
      throw new Error('El servidor tardó demasiado en responder. Inténtalo de nuevo.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.message || `API error: ${res.status}`) as Error & { errors?: Record<string, string[]>; status?: number };
    error.errors = body.errors;
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export type ProductQueryParams = Record<string, string | string[] | number | undefined>;

export function getProducts(params?: ProductQueryParams) {
  if (!params) return fetchApi<ProductsResponse>('/products');
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const item of value) usp.append(`${key}[]`, String(item));
    } else {
      usp.append(key, String(value));
    }
  }
  return fetchApi<ProductsResponse>(`/products?${usp.toString()}`);
}

export function getProductBySlug(slug: string) {
  return fetchApi<SingleProductResponse>(`/products/slug/${slug}`);
}

export function getProductById(id: number) {
  return fetchApi<SingleProductResponse>(`/products/${id}`);
}

export function getCategories() {
  return fetchApi<CategoriesResponse>('/categories');
}

export function getBrands() {
  return fetchApi<BrandsResponse>('/brands');
}

// Envío
export interface ShippingConfig {
  flat_rate: number;
  free_threshold: number | null;
}

export function getShippingConfig() {
  return fetchApi<{ success: boolean; data: ShippingConfig }>('/shipping');
}

// Auth
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles?: string[];
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: { user: AuthUser; token: string };
}

export function loginApi(email: string, password: string) {
  return fetchApi<AuthResponse>('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function registerApi(name: string, email: string, password: string, passwordConfirmation: string) {
  return fetchApi<AuthResponse>(
    '/register', { method: 'POST', body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirmation }) }
  );
}

export function logoutApi() {
  return fetchApi<{ success: boolean; message: string }>('/logout', { method: 'POST' });
}

export function getUserApi() {
  return fetchApi<{ success: boolean; data: AuthUser }>('/user');
}

export function updateProfileApi(name: string, email: string) {
  return fetchApi<{ success: boolean; message: string; data: AuthUser }>(
    '/profile', { method: 'POST', body: JSON.stringify({ name, email }) }
  );
}

export function changePasswordApi(currentPassword: string, password: string, passwordConfirmation: string) {
  return fetchApi<{ success: boolean; message: string }>(
    '/profile/password', { method: 'POST', body: JSON.stringify({ current_password: currentPassword, password, password_confirmation: passwordConfirmation }) }
  );
}

export function forgotPasswordApi(email: string) {
  return fetchApi<{ success: boolean; message: string }>(
    '/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }
  );
}

export function resetPasswordApi(token: string, email: string, password: string, passwordConfirmation: string) {
  return fetchApi<{ success: boolean; message: string }>(
    '/reset-password', { method: 'POST', body: JSON.stringify({ token, email, password, password_confirmation: passwordConfirmation }) }
  );
}

// Orders
export interface CreateOrderPayload {
  shipping_fullname: string;
  shipping_phone?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_notes?: string;
  items: { product_id: number; quantity: number; variant_id?: number }[];
}

export function createOrder(payload: CreateOrderPayload) {
  return fetchApi<OrderResponse>('/orders', { method: 'POST', body: JSON.stringify(payload) });
}

export function getOrders() {
  return fetchApi<OrdersResponse>('/orders');
}

export function getOrder(id: number) {
  return fetchApi<OrderResponse>(`/orders/${id}`);
}

export function cancelOrderApi(id: number) {
  return fetchApi<OrderResponse>(`/orders/${id}/cancel`, { method: 'POST' });
}

// Mercado Pago
export interface PreferenceResponse {
  success: boolean;
  data: {
    init_point: string;
    preference_id: string;
  };
}

export function createPreference(orderId: number) {
  return fetchApi<PreferenceResponse>(`/orders/${orderId}/checkout`, { method: 'POST' });
}

export function getPaymentStatus(orderId: number) {
  return fetchApi<OrderResponse>(`/orders/${orderId}/payment-status`);
}

// Carrito persistente (requiere sesión)
export interface ServerCartItem {
  id: number;
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
}

export interface CartData {
  id: number;
  items: ServerCartItem[];
}

export interface CartResponse {
  success: boolean;
  data: CartData;
}

export interface CartItemPayload {
  product_id: number;
  quantity: number;
  variant_id?: number;
}

export function getCartApi() {
  return fetchApi<CartResponse>('/cart');
}

export function addCartItemApi(productId: number, quantity: number, variantId?: number) {
  return fetchApi<CartResponse>('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity, variant_id: variantId }),
  });
}

export function updateCartItemApi(id: number, quantity: number) {
  return fetchApi<CartResponse>(`/cart/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItemApi(id: number) {
  return fetchApi<CartResponse>(`/cart/items/${id}`, { method: 'DELETE' });
}

export function clearCartApi() {
  return fetchApi<CartResponse>('/cart', { method: 'DELETE' });
}

export function syncCartApi(items: CartItemPayload[]) {
  return fetchApi<CartResponse>('/cart/sync', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}


