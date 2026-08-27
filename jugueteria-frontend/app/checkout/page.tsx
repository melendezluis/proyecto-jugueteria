'use client';

import { useEffect, useState, FormEvent, Fragment } from 'react';
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

/* ---------- Iconos (SVG inline, sin dependencias) ---------- */

type IconProps = { className?: string };

function TruckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
      />
    </svg>
  );
}

function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  );
}

function MapPinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

function BuildingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104c.251.023.501.05.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v.407a22.459 22.459 0 01-1.364 5.342M9.75 3.104C9.022 3.036 8.29 3 7.546 3c-.276 0-.54.02-.796.063M9.75 3.104V9m-6 8.25h13.5" />
    </svg>
  );
}

function BagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
      />
    </svg>
  );
}

function LockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

function ReturnIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

function AlertIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z"
      />
    </svg>
  );
}

function SpinnerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`animate-spin ${className ?? ''}`}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

/* ---------- Stepper ---------- */

const CHECKOUT_STEPS = ['Carrito', 'Envío', 'Confirmación'];

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center mb-10 max-w-md">
      {CHECKOUT_STEPS.map((label, i) => {
        const step = i + 1;
        const isDone = step < current;
        const isCurrent = step === current;
        return (
          <Fragment key={label}>
            {i > 0 && (
              <li aria-hidden="true" className="flex-1 h-0.5 mx-2 sm:mx-3 rounded-full">
                <div className={`h-full ${step <= current ? 'bg-[#287FF0]' : 'bg-gray-200'}`} />
              </li>
            )}
            <li className="flex items-center gap-2">
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                  isDone
                    ? 'bg-[#287FF0] text-white'
                    : isCurrent
                      ? 'bg-white border-2 border-[#287FF0] text-[#287FF0]'
                      : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isDone ? '✓' : step}
              </span>
              <span
                className={`text-sm whitespace-nowrap ${
                  isCurrent ? 'font-bold text-gray-800' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}

/* ---------- Formulario ---------- */

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
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

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

  const inputClass = (hasError?: boolean) =>
    `w-full px-4 py-3 border-2 rounded-xl bg-white transition-all text-gray-800 placeholder:text-gray-400 focus:outline-none ${
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
        : 'border-gray-200 focus:border-[#287FF0] focus:ring-4 focus:ring-blue-100'
    }`;

  const inputWithIconClass = (hasError?: boolean) => `${inputClass(hasError)} pl-11`;

  const ErrorText = ({ message }: { message?: string }) =>
    message ? <p className="text-sm text-red-600 mt-1.5">{message}</p> : null;

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Columna izquierda: datos de envío */}
      <div className="lg:col-span-2 space-y-6">
        {generalError && (
          <div
            role="alert"
            className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-2xl text-sm font-medium"
          >
            <AlertIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3.5 mb-7 pb-5 border-b border-gray-100">
            <div className="w-11 h-11 rounded-2xl bg-[#E7EBFE] flex items-center justify-center flex-shrink-0">
              <TruckIcon className="w-6 h-6 text-[#287FF0]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Datos de envío</h2>
              <p className="text-sm text-gray-500">¿A dónde enviaremos tus juguetes?</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="fullname" className="block text-sm font-semibold text-gray-600 mb-1.5">
                Nombre completo
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  id="fullname"
                  type="text"
                  value={fullname}
                  onChange={e => setFullname(e.target.value)}
                  required
                  autoComplete="name"
                  className={inputWithIconClass(!!fieldErrors.shipping_fullname)}
                />
              </div>
              <ErrorText message={fieldErrors.shipping_fullname} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-600 mb-1.5">
                  Teléfono
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Opcional"
                    autoComplete="tel"
                    className={inputWithIconClass()}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-gray-600 mb-1.5">
                  Ciudad
                </label>
                <div className="relative">
                  <BuildingIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                    autoComplete="address-level2"
                    className={inputWithIconClass(!!fieldErrors.shipping_city)}
                  />
                </div>
                <ErrorText message={fieldErrors.shipping_city} />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-600 mb-1.5">
                Dirección
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  placeholder="Calle, número, distrito, referencias"
                  autoComplete="street-address"
                  className={inputWithIconClass(!!fieldErrors.shipping_address)}
                />
              </div>
              <ErrorText message={fieldErrors.shipping_address} />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-600 mb-1.5">
                Instrucciones especiales para su pedido
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Opcional. Ej.: dejar en recepción, llamar al llegar..."
                className={`${inputClass()} resize-none`}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Columna derecha: resumen del pedido */}
      <aside className="lg:sticky lg:top-24 h-fit">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E7EBFE] flex items-center justify-center">
                <BagIcon className="w-5 h-5 text-[#287FF0]" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Tu pedido</h2>
            </div>
            <span className="bg-[#E7EBFE] text-[#1B66D0] text-xs font-bold px-3 py-1.5 rounded-full">
              {totalUnits} {totalUnits === 1 ? 'artículo' : 'artículos'}
            </span>
          </div>

          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-1">
            {items.map(item => {
              const itemPrice = item.product.offer_price ?? item.product.price;
              const unitPrice = itemPrice + (item.variant?.price_extra ?? 0);
              const totalItemPrice = unitPrice * item.quantity;
              const hasOffer = item.product.offer_price !== null && item.product.offer_price < item.product.price;
              return (
                <div key={`${item.product.id}-${item.variant?.id ?? ''}`} className="flex gap-3.5">
                  <div className="relative w-16 h-16 bg-gradient-to-br from-sky-100 to-blue-200 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                    🧸
                    
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{item.product.name}</p>
                    {(item.variant?.color || item.variant?.size) && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {[item.variant?.color && `Color: ${item.variant.color}`, item.variant?.size && `Talla: ${item.variant.size}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      S/ {unitPrice.toFixed(2)} c/u
                      {hasOffer && <span className="ml-1 text-pink-600 font-medium">Oferta</span>}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-800 whitespace-nowrap">S/ {totalItemPrice.toFixed(2)}</p>
                </div>
              );
            })}
          </div>

          <div className="space-y-2.5 text-gray-600 text-sm border-t border-dashed border-gray-200 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-800">S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span className="font-semibold text-gray-800">S/ {shipping.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center bg-[#E7EBFE] rounded-2xl px-4 py-3.5 mt-4">
            <span className="font-bold text-gray-800">Total</span>
            <span className="text-2xl font-extrabold text-[#1B66D0]">S/ {total.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#C4785C] to-[#A85D42] hover:from-[#B56A4E] hover:to-[#9A5238] disabled:from-gray-300 disabled:to-gray-300 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] text-lg shadow-lg shadow-orange-200 disabled:shadow-none btn-shimmer"
          >
            {submitting ? (
              <>
                <SpinnerIcon className="w-5 h-5" />
                Procesando pedido...
              </>
            ) : (
              'Confirmar pedido'
            )}
          </button>

          <div className="mt-5 pt-4 border-t border-gray-100 space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-gray-500">
              <LockIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              Compra segura, tus datos están protegidos
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-500">
              <ReturnIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              Devoluciones fáciles dentro de los primeros 30 días
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="block text-center text-gray-500 hover:text-[#287FF0] text-sm font-medium mt-5 transition-colors"
        >
          ← Seguir comprando
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
        <nav className="mb-5 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#287FF0] transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 font-medium">Checkout</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">Finaliza tu compra</h1>
        <p className="text-gray-500 mb-8">Completa tus datos de envío y recibe tus juguetes en casa.</p>

        <Stepper current={2} />

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center text-5xl mb-5">
              🛒
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-1.5">Tu carrito está vacío</p>
            <p className="text-gray-500 mb-7">Agrega algunos juguetes para continuar con tu compra.</p>
            <Link
              href="/"
              className="inline-block bg-[#287FF0] hover:bg-[#1B66D0] text-white font-semibold px-8 py-3.5 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-200"
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
