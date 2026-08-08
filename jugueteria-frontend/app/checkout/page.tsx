'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { createOrder, createPreference } from '@/services/api';
import { getImageUrl } from '@/services/api';

const SHIPPING_COST = 10;

interface ApiError extends Error {
  errors?: Record<string, string[]>;
  status?: number;
}

interface CheckoutUser {
  id: number;
  name: string;
  email: string;
}

function CheckoutForm({ user }: { user: CheckoutUser }) {
  const router = useRouter();
  const { items, clearCart, totalPrice } = useCart();

  const [fullname, setFullname] = useState(user.name);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = totalPrice;
  const shipping = items.length > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await createOrder({
        shipping_fullname: fullname,
        shipping_phone: phone || undefined,
        shipping_address: address,
        shipping_city: city,
        shipping_notes: notes || undefined,
        shipping,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          variant_id: item.variant?.id,
        })),
      });

      clearCart();

      try {
        const preference = await createPreference(res.data.id);
        window.location.href = preference.data.init_point;
      } catch {
        router.push(`/order-confirmation/${res.data.id}`);
      }
    } catch (err) {
      const error = err as ApiError;
      if (error.errors) {
        const mapped: Record<string, string> = {};
        Object.entries(error.errors).forEach(([key, value]) => {
          mapped[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFieldErrors(mapped);
      }
      setGeneralError(error.message || 'Error al procesar el pedido');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {generalError && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
            {generalError}
          </div>
        )}

        <section className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Datos para el envío de su compra</h2>
          <div className="space-y-5">
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-600 mb-1">
                Nombre completo
              </label>
              <input
                id="fullname"
                type="text"
                value={fullname}
                onChange={e => setFullname(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-800"
              />
              {fieldErrors.shipping_fullname && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.shipping_fullname}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Opcional"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-800"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-600 mb-1">
                Dirección
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-800"
              />
              {fieldErrors.shipping_address && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.shipping_address}</p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-600 mb-1">
                Ciudad
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-800"
              />
              {fieldErrors.shipping_city && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.shipping_city}</p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-600 mb-1">
                Notas de envío
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Opcional"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-800"
              />
            </div>
          </div>
        </section>
      </div>

      <aside className="bg-white rounded-3xl p-8 shadow-sm h-fit lg:sticky lg:top-24">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Tus pedidos</h2>
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-1">
          {items.map(item => {
            const itemPrice = item.product.offer_price ?? item.product.price;
            const totalItemPrice = (itemPrice + (item.variant?.price_extra ?? 0)) * item.quantity;
            return (
              <div key={`${item.product.id}-${item.variant?.id ?? ''}`} className="flex gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                  {(() => {
                    const img = item.product.images.find(i => i.is_main)?.image_path
                      ?? item.product.images[0]?.image_path
                      ?? null;
                    return img ? (
                      <img
                        src={getImageUrl(img) ?? undefined}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : <span>🧸</span>;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{item.product.name}</p>
                  {item.variant?.color && (
                    <p className="text-xs text-gray-500">Color: {item.variant.color}</p>
                  )}
                  {item.variant?.size && (
                    <p className="text-xs text-gray-500">Talla: {item.variant.size}</p>
                  )}
                  <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800">S/ {totalItemPrice.toFixed(2)}</p>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-4 space-y-2 text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium">S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío</span>
            <span className="font-medium">S/ {shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-800 pt-2">
            <span>Total</span>
            <span className="text-blue-600">S/ {total.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-orange-400 text-white font-semibold py-4 rounded-2xl transition-all text-lg mt-6"
        >
          {submitting ? 'Procesando pedido...' : 'Confirmar pedido'}
        </button>

        <Link
          href="/"
          className="block text-center text-gray-500 hover:text-blue-600 text-sm mt-4 transition-colors"
        >
          Seguir comprando
        </Link>
      </aside>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { items } = useCart();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-2xl text-gray-500 animate-pulse">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">Checkout</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">Datos para su compra</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl">
            <span className="text-6xl block mb-4">🛒</span>
            <p className="text-2xl text-gray-600 mb-4">Tu carrito está vacío</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full transition-all"
            >
              Ver juguetes
            </Link>
          </div>
        ) : (
          <CheckoutForm user={user} />
        )}
      </div>
    </div>
  );
}
