import type {
  ProductsResponse,
  SingleProductResponse,
  CategoriesResponse,
  BrandsResponse,
  OrderResponse,
  OrdersResponse,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_URL.replace(/\/api\/?$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { ...headers, ...options?.headers as Record<string, string> },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.message || `API error: ${res.status}`) as Error & { errors?: Record<string, string[]>; status?: number };
    error.errors = body.errors;
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export function getProducts(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchApi<ProductsResponse>(`/products${query}`);
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

// Auth
export function loginApi(email: string, password: string) {
  return fetchApi<{ success: boolean; message: string; data: { user: { id: number; name: string; email: string }; token: string } }>(
    '/login', { method: 'POST', body: JSON.stringify({ email, password }) }
  );
}

export function registerApi(name: string, email: string, password: string, passwordConfirmation: string) {
  return fetchApi<{ success: boolean; message: string; data: { user: { id: number; name: string; email: string }; token: string } }>(
    '/register', { method: 'POST', body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirmation }) }
  );
}

export function logoutApi() {
  return fetchApi<{ success: boolean; message: string }>('/logout', { method: 'POST' });
}

export function getUserApi() {
  return fetchApi<{ success: boolean; data: { id: number; name: string; email: string } }>('/user');
}

// Orders
export interface CreateOrderPayload {
  shipping_fullname: string;
  shipping_phone?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_notes?: string;
  shipping?: number;
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


