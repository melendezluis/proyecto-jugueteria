'use client';

import { useCallback, useState, FormEvent, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useShippingConfig, quoteShipping } from '@/hooks/useShippingConfig';
import {
  createOrder,
  createPreference,
  getImageUrl,
  rememberGuestOrderToken,
  validateCouponApi,
} from '@/services/api';
import type { PickedAddress } from '@/components/checkout/MapPicker';

const MapPicker = dynamic(() => import('@/components/checkout/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 sm:h-72 rounded-2xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-sm text-gray-400 animate-pulse">
      Cargando mapa...
    </div>
  ),
});

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

function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
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

function StoreIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 21h16.5M4.5 3h15M5.25 3v18M18.75 3v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
      />
    </svg>
  );
}

function GiftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18M9.75 21v-8.25m4.5 8.25v-8.25"
      />
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

function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
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

function ErrorText({ message }: { message?: string }) {
  return message ? <p className="text-sm text-red-600 mt-1.5">{message}</p> : null;
}

function CheckoutForm({ user }: { user: CheckoutUser | null }) {
  const router = useRouter();
  const { items, totalPrice } = useCart();
  const shippingConfig = useShippingConfig();

  const [fullname, setFullname] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'shipping' | 'pickup'>('shipping');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; itemsKey: string } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const isShipping = deliveryMethod === 'shipping';
  const subtotal = totalPrice;
  const couponItemsKey = items
    .map(item => `${item.product.id}-${item.variant?.id ?? 0}-${item.quantity}`)
    .join('|');
  const coupon = appliedCoupon?.itemsKey === couponItemsKey ? appliedCoupon : null;
  const couponStale = appliedCoupon !== null && coupon === null;
  const couponMessage = couponStale ? 'El carrito cambió. Vuelve a aplicar el cupón.' : couponError;
  const couponDiscount = coupon?.discount ?? 0;
  const shippingQuote = quoteShipping(
    subtotal,
    shippingConfig,
    isShipping ? location?.lat : null,
    isShipping ? location?.lng : null
  );
  const shipping = isShipping ? shippingQuote.rate ?? 0 : 0;
  const total = subtotal - couponDiscount + shipping;
  const canSubmit = !submitting && (!isShipping || shippingQuote.available);
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleMapPick = useCallback((lat: number, lng: number, pickedAddress: PickedAddress | null) => {
    setLocation({ lat, lng });
    if (pickedAddress) {
      setAddress(pickedAddress.address);
      if (pickedAddress.number) {
        setAddressNumber(pickedAddress.number);
      }
    }
  }, []);

  async function handleApplyCoupon() {
    const code = couponInput.trim();

    if (!code) {
      setCouponError('Ingresa el código del cupón.');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await validateCouponApi(
        code,
        items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          variant_id: item.variant?.id,
        })),
        user ? undefined : email.trim()
      );

      setAppliedCoupon({ code: res.data.code, discount: res.data.discount, itemsKey: couponItemsKey });
      setCouponInput(res.data.code);
    } catch (err) {
      const error = err as ApiError;
      setAppliedCoupon(null);
      setCouponError(error.errors?.coupon_code?.[0] ?? error.message ?? 'No se pudo aplicar el cupón.');
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    const errors: Record<string, string> = {};
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (fullname.trim().length < 3) {
      errors.shipping_fullname = 'Ingresa tu nombre completo.';
    }
    if (!user) {
      const cleanEmail = email.trim();
      if (!cleanEmail) {
        errors.guest_email = 'Ingresa tu correo para enviarte la confirmación.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        errors.guest_email = 'Ingresa un correo válido.';
      }
    }
    if (!cleanPhone) {
      errors.shipping_phone = 'Ingresa tu teléfono.';
    } else if (!/^9\d{8}$/.test(cleanPhone)) {
      errors.shipping_phone = 'Ingresa un teléfono válido (9 dígitos, empieza con 9).';
    }
    if (isShipping) {
      if (address.trim().length < 3) {
        errors.shipping_address = 'Ingresa tu dirección (calle o avenida).';
      }
      if (addressNumber.trim().length < 1) {
        errors.shipping_address_number = 'Ingresa el número de casa, lote o piso.';
      }
      if (!location) {
        errors.shipping_latitude = 'Marca tu ubicación en el mapa para calcular el envío.';
      } else if (shippingQuote.zone === 'out_of_coverage') {
        errors.shipping_latitude = `No hay cobertura de envío a más de ${shippingConfig.max_radius_km} km desde Chancay. Puedes elegir recojo en tienda.`;
      }
    }
    if (!acceptedTerms) {
      errors.terms = 'Debes aceptar los términos, la política de privacidad y la política de envíos y devoluciones.';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const res = await createOrder({
        delivery_method: deliveryMethod,
        guest_email: user ? undefined : email.trim(),
        coupon_code: coupon?.code,
        gift_wrap: giftWrap,
        gift_message: giftMessage.trim() || undefined,
        shipping_fullname: fullname.trim(),
        shipping_phone: cleanPhone,
        shipping_address: isShipping ? address.trim() : undefined,
        shipping_address_number: isShipping ? addressNumber.trim() : undefined,
        shipping_latitude: isShipping && location ? location.lat : undefined,
        shipping_longitude: isShipping && location ? location.lng : undefined,
        shipping_notes: isShipping && notes.trim() ? notes.trim() : undefined,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          variant_id: item.variant?.id,
        })),
      });

      const guestToken = res.guest_token ?? null;
      if (guestToken) {
        rememberGuestOrderToken(res.data.id, guestToken);
      }

      try {
        const preference = await createPreference(res.data.id, guestToken);
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
        if (mapped.coupon_code) {
          setAppliedCoupon(null);
          setCouponError(mapped.coupon_code);
          delete mapped.coupon_code;
        }
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

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Columna izquierda: datos de entrega */}
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
              <UserIcon className="w-6 h-6 text-[#287FF0]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Tus datos</h2>
              <p className="text-sm text-gray-500">Así podremos contactarte por tu pedido.</p>
            </div>
          </div>

          <div className="space-y-5">
            {!user && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                Estás comprando como invitado. No necesitas crear una cuenta; enviaremos la
                confirmación y el detalle de tu compra a tu correo.
              </div>
            )}

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
                  placeholder="Nombres y apellidos"
                  autoComplete="name"
                  className={inputWithIconClass(!!fieldErrors.shipping_fullname)}
                />
              </div>
              <ErrorText message={fieldErrors.shipping_fullname} />
            </div>

            {!user ? (
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-600 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="tucorreo@ejemplo.com"
                    autoComplete="email"
                    className={inputWithIconClass(!!fieldErrors.guest_email)}
                  />
                </div>
                <ErrorText message={fieldErrors.guest_email} />
              </div>
            ) : (
              <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                Enviaremos la confirmación de tu compra a <span className="font-semibold text-gray-700">{user.email}</span>.
              </p>
            )}

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
                  required
                  placeholder="Ej. 987654321"
                  autoComplete="tel"
                  className={inputWithIconClass(!!fieldErrors.shipping_phone)}
                />
              </div>
              <ErrorText message={fieldErrors.shipping_phone} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3.5 mb-7 pb-5 border-b border-gray-100">
            <div className="w-11 h-11 rounded-2xl bg-[#E7EBFE] flex items-center justify-center flex-shrink-0">
              <TruckIcon className="w-6 h-6 text-[#287FF0]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Forma de entrega</h2>
              <p className="text-sm text-gray-500">Elige cómo quieres recibir tus juguetes.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setDeliveryMethod('shipping')}
              className={`text-left rounded-2xl border-2 p-4 transition-all ${
                isShipping
                  ? 'border-[#287FF0] bg-[#F4F7FF] ring-4 ring-blue-100'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2 font-bold text-gray-800">
                <TruckIcon className="w-5 h-5 text-[#287FF0]" />
                Envío a domicilio
              </span>
              <span className="block text-xs text-gray-500 mt-1">Recibe tu pedido en la dirección que indiques.</span>
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMethod('pickup')}
              className={`text-left rounded-2xl border-2 p-4 transition-all ${
                !isShipping
                  ? 'border-[#287FF0] bg-[#F4F7FF] ring-4 ring-blue-100'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2 font-bold text-gray-800">
                <StoreIcon className="w-5 h-5 text-[#287FF0]" />
                Recojo en tienda
              </span>
              <span className="block text-xs text-gray-500 mt-1">Recoge tu pedido sin costo de envío.</span>
            </button>
          </div>

          {isShipping ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-600 mb-1.5">
                    Dirección
                  </label>
                  <div className="relative">
                    <BuildingIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      id="address"
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      required
                      maxLength={500}
                      placeholder="Calle, avenida, distrito o referencia"
                      autoComplete="address-line1"
                      className={inputWithIconClass(!!fieldErrors.shipping_address)}
                    />
                  </div>
                  <ErrorText message={fieldErrors.shipping_address} />
                </div>

                <div>
                  <label htmlFor="address_number" className="block text-sm font-semibold text-gray-600 mb-1.5">
                    Número / piso
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      id="address_number"
                      type="text"
                      value={addressNumber}
                      onChange={e => setAddressNumber(e.target.value)}
                      required
                      maxLength={100}
                      placeholder="Ej. 123, dpto. 4B"
                      autoComplete="address-line2"
                      className={inputWithIconClass(!!fieldErrors.shipping_address_number)}
                    />
                  </div>
                  <ErrorText message={fieldErrors.shipping_address_number} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-600">Ubica tu dirección en el mapa</label>
                  <span className="text-xs text-gray-400">Opcional</span>
                </div>
                <MapPicker
                  latitude={location?.lat ?? null}
                  longitude={location?.lng ?? null}
                  onPick={handleMapPick}
                />
                <ErrorText message={fieldErrors.shipping_latitude} />
                {!location && (
                  <p className="text-xs text-amber-600 mt-2">
                    Marca tu ubicación en el mapa para calcular el costo de envío.
                  </p>
                )}
                {location && shippingQuote.available && (
                  <p className="text-xs font-medium text-emerald-700 mt-2">
                    {shippingQuote.zone === 'chancay' ? 'Chancay' : 'Zona cercana'} · aprox.{' '}
                    {shippingQuote.distanceKm?.toFixed(1)} km · Envío S/ {shipping.toFixed(2)}
                  </p>
                )}
                {location && shippingQuote.zone === 'out_of_coverage' && (
                  <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-3.5 py-3 rounded-xl text-sm">
                    No hay cobertura de envío a más de {shippingConfig.max_radius_km} km desde Chancay.
                    Puedes elegir <strong>recojo en tienda</strong> para continuar.
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-600 mb-1.5">
                  Instrucciones de envío
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Opcional. Ej.: dejar en recepción, llamar al llegar..."
                  className={`${inputClass()} resize-none`}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <StoreIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-800">Recojo en tienda</p>
                <p className="text-emerald-700 mt-0.5">
                  No se cobrará envío. Te avisaremos cuando tu pedido esté listo para recoger.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3.5 mb-7 pb-5 border-b border-gray-100">
            <div className="w-11 h-11 rounded-2xl bg-[#E7EBFE] flex items-center justify-center flex-shrink-0">
              <GiftIcon className="w-6 h-6 text-[#287FF0]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Regalo y dedicatoria</h2>
              <p className="text-sm text-gray-500">Haz que tu pedido sea aún más especial.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <span className="block text-sm font-semibold text-gray-600 mb-2">
                ¿Quieres que lo envolvamos para regalo?
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGiftWrap(true)}
                  className={`rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                    giftWrap
                      ? 'border-[#287FF0] bg-[#F4F7FF] text-[#1B66D0] ring-4 ring-blue-100'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Sí, envolver para regalo
                </button>
                <button
                  type="button"
                  onClick={() => setGiftWrap(false)}
                  className={`rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                    !giftWrap
                      ? 'border-[#287FF0] bg-[#F4F7FF] text-[#1B66D0] ring-4 ring-blue-100'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  No, entregar sin envolver
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="giftMessage" className="block text-sm font-semibold text-gray-600 mb-1.5">
                Dedicatoria
              </label>
              <textarea
                id="giftMessage"
                value={giftMessage}
                onChange={e => setGiftMessage(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Opcional. Escribe un mensaje para la tarjeta del regalo..."
                className={`${inputClass()} resize-none`}
              />
              <p className="text-xs text-gray-400 mt-1">{giftMessage.length}/1000</p>
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
              const imagePath =
                item.product.images?.find(img => img.is_main)?.image_path ??
                item.product.images?.[0]?.image_path ??
                null;
              const thumb = getImageUrl(imagePath);
              return (
                <div key={`${item.product.id}-${item.variant?.id ?? ''}`} className="flex gap-3.5">
                  <div className="relative w-16 h-16 bg-gradient-to-br from-sky-100 to-blue-200 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                    {thumb ? (
                      <img src={thumb} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      '🧸'
                    )}
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

          <div className="mb-4">
            {coupon ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                    Cupón aplicado
                  </p>
                  <p className="text-sm font-bold text-emerald-800">{coupon.code}</p>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={event => setCouponInput(event.target.value.toUpperCase())}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                  placeholder="Código de descuento"
                  maxLength={50}
                  className={`${inputClass(!!couponMessage)} text-sm uppercase`}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className="shrink-0 rounded-xl border-2 border-[#287FF0]/30 bg-[#287FF0]/5 px-4 text-sm font-bold text-[#1B66D0] transition-colors hover:bg-[#287FF0]/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {couponLoading ? '...' : 'Aplicar'}
                </button>
              </div>
            )}
            {couponMessage && <p className="mt-1.5 text-xs font-medium text-red-600">{couponMessage}</p>}
          </div>

          <div className="space-y-2.5 text-gray-600 text-sm border-t border-dashed border-gray-200 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-800">S/ {subtotal.toFixed(2)}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-emerald-700">
                <span>Descuento ({coupon.code})</span>
                <span className="font-semibold">- S/ {couponDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>
                {isShipping
                  ? shippingQuote.zone === 'out_of_coverage'
                    ? 'Envío sin cobertura'
                    : shippingQuote.available
                      ? 'Envío'
                      : 'Envío por calcular'
                  : 'Recojo en tienda'}
              </span>
              <span className="font-semibold text-gray-800">
                {isShipping
                  ? shippingQuote.available
                    ? `S/ ${shipping.toFixed(2)}`
                    : '—'
                  : 'Sin costo'}
              </span>
            </div>
            {giftWrap && (
              <div className="flex justify-between">
                <span>Envoltura para regalo</span>
                <span className="font-semibold text-emerald-600">Gratis</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center bg-[#E7EBFE] rounded-2xl px-4 py-3.5 mt-4">
            <span className="font-bold text-gray-800">Total</span>
            <span className="text-2xl font-extrabold text-[#1B66D0]">S/ {total.toFixed(2)}</span>
          </div>

          <div className="mt-4">
            <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-gray-600">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={event => {
                  setAcceptedTerms(event.target.checked);
                  if (event.target.checked) {
                    setFieldErrors(current => {
                      const next = { ...current };
                      delete next.terms;
                      return next;
                    });
                  }
                }}
                className="mt-1 h-4 w-4 flex-shrink-0 accent-[#5EA57E]"
              />
              <span>
                Acepto los{' '}
                <Link
                  href="/terminos-y-condiciones"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1B66D0] underline underline-offset-2"
                >
                  Términos y Condiciones
                </Link>{' '}
                y la{' '}
                <Link
                  href="/politica-de-privacidad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1B66D0] underline underline-offset-2"
                >
                  Política de Privacidad
                </Link>
                . Declaro haber leído la{' '}
                <Link
                  href="/politica-de-envios-y-devoluciones"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1B66D0] underline underline-offset-2"
                >
                  Política de Envíos y Devoluciones
                </Link>
                .
              </span>
            </label>
            {fieldErrors.terms && (
              <p className="mt-2 text-xs font-semibold text-red-600">
                {fieldErrors.terms}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full mt-6 inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#5EA57E] to-[#4E8A68] hover:from-[#4E8A68] hover:to-[#3F7357] disabled:from-gray-300 disabled:to-gray-300 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] text-lg shadow-lg shadow-green-200 disabled:shadow-none border-2 border-[#3F7357] btn-shimmer"
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
          className="mt-5 w-full inline-flex items-center justify-center gap-2 border-2 border-[#287FF0]/30 bg-[#287FF0]/5 hover:bg-[#287FF0]/10 text-[#1B66D0] hover:text-[#1558B8] font-semibold py-3 rounded-2xl transition-all active:scale-[0.98] text-sm"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Seguir comprando
        </Link>
      </aside>
    </form>
  );
}

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items } = useCart();

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-2xl text-gray-500 animate-pulse">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <nav className="mb-5 text-sm text-gray-400 flex items-center">
          <Link href="/" className="inline-flex items-center gap-1.5 leading-none hover:text-[#287FF0] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" />
            </svg>
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 font-medium">Checkout</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">Finaliza tu compra</h1>
        <p className="text-gray-500 mb-8">Completa tus datos de entrega y recibe tus juguetes como prefieras.</p>

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
