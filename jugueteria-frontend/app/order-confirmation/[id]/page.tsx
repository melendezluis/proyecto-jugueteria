'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getOrder,
  getPaymentStatus,
  createPreference,
  cancelOrderApi,
  getGuestOrderToken,
  rememberGuestOrderToken,
  getImageUrl,
} from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import type { Order } from '@/types';

interface ApiError extends Error {
  status?: number;
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  approved: 'Tu pago fue procesado correctamente.',
  success: 'Tu pago fue procesado correctamente.',
  pending: 'Tu pago está en proceso. Te avisaremos apenas se confirme.',
  failure: 'El pago no se completó. Puedes intentarlo nuevamente.',
  rejected: 'El pago no se completó. Puedes intentarlo nuevamente.',
};

const STATUS_TONE: Record<string, string> = {
  approved: 'bg-green-50 border-green-200 text-green-700',
  success: 'bg-green-50 border-green-200 text-green-700',
  pending: 'bg-amber-50 border-amber-200 text-amber-700',
  failure: 'bg-red-50 border-red-200 text-red-700',
  rejected: 'bg-red-50 border-red-200 text-red-700',
};

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const paymentNotice = searchParams.get('status');
  const queryToken = searchParams.get('token');
  const orderId = Number(id);
  const validId = Number.isInteger(orderId) && orderId > 0;

  useEffect(() => {
    if (!validId || !queryToken) return;
    rememberGuestOrderToken(orderId, queryToken);
  }, [orderId, queryToken, validId]);

  useEffect(() => {
    if (authLoading || !validId) return;

    async function loadOrder() {
      const token = getGuestOrderToken(orderId) ?? queryToken;

      if (!isAuthenticated && !token) {
        setError('No pudimos identificar este pedido. Revisa el enlace que enviamos a tu correo.');
        setLoading(false);
        return;
      }

      try {
        const res = await getOrder(orderId, token);
        setOrder(res.data);
      } catch {
        setError('No se pudo cargar tu pedido');
      } finally {
        setLoading(false);
      }
    }

    void loadOrder();
  }, [orderId, validId, isAuthenticated, authLoading, queryToken]);

  useEffect(() => {
    if (!order || order.status !== 'pending') return;
    const timer = setInterval(() => {
      const token = getGuestOrderToken(orderId) ?? queryToken;
      getPaymentStatus(orderId, token)
        .then(res => setOrder(res.data))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  }, [order, orderId, queryToken]);

  useEffect(() => {
    if (order?.status === 'paid') {
      clearCart();
    }
  }, [order?.status, clearCart]);

  async function handlePay() {
    setPaying(true);
    setPayError('');
    try {
      const token = getGuestOrderToken(orderId) ?? queryToken;
      const preference = await createPreference(orderId, token);
      window.location.href = preference.data.init_point;
    } catch (err) {
      const error = err as ApiError;
      setPayError(error.message || 'No se pudo iniciar el pago');
    } finally {
      setPaying(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm('¿Seguro que deseas cancelar este pedido?')) return;
    setCancelling(true);
    setCancelError('');
    try {
      const token = getGuestOrderToken(orderId) ?? queryToken;
      const res = await cancelOrderApi(orderId, token);
      setOrder(res.data);
    } catch (err) {
      const error = err as ApiError;
      setCancelError(error.message || 'No se pudo cancelar el pedido');
    } finally {
      setCancelling(false);
    }
  }

  if (!validId) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <span className="text-6xl block mb-4">😿</span>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Pedido no encontrado</h2>
        <Link href="/" className="text-pink-600 hover:text-pink-700 font-medium text-lg">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-2xl text-gray-500 animate-pulse">Cargando pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <span className="text-6xl block mb-4">😿</span>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{error || 'Pedido no encontrado'}</h2>
        <Link href="/" className="text-pink-600 hover:text-pink-700 font-medium text-lg">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  const isPaid = order.status === 'paid';
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <div className="bg-white rounded-3xl shadow-sm p-10">
          <span className="text-7xl block mb-6">{isPaid ? '🎉' : isCancelled ? '😿' : '🧸'}</span>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {isPaid ? '¡Pago confirmado!' : isCancelled ? 'Pedido cancelado' : '¡Gracias por tu compra!'}
          </h1>
          <p className="text-gray-500 mb-6">
            {isCancelled
              ? 'Tu pedido fue cancelado y el stock quedó liberado. Si pagaste por error, contacta con nosotros.'
              : (
                <>Tu pedido <span className="font-semibold text-pink-600">{order.order_number}</span> ha sido
                registrado con éxito.</>
              )}
          </p>

          {order.guest_email && (
            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-left text-sm text-blue-800">
              Enviamos la confirmación y el detalle de tu compra a{' '}
              <span className="font-semibold">{order.guest_email}</span>. Guarda el enlace de ese correo
              para volver a consultar tu pedido.
            </div>
          )}

          <div className="bg-[#B0FFDC4D] rounded-2xl p-6 text-left mb-8">
            <p className="font-semibold text-gray-800 mb-4">Resumen del pedido</p>
            <div className="space-y-3">
              {order.items.map(item => {
                const thumb = getImageUrl(item.product_image);
                return (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                        {thumb ? (
                          <img src={thumb} alt={item.product_name} className="w-full h-full object-cover" />
                        ) : (
                          '🧸'
                        )}
                      </div>
                      <span className="text-gray-700 text-sm">
                        {item.quantity} x {item.product_name}
                        {item.color && <span className="text-gray-500"> ({item.color})</span>}
                        {item.size && <span className="text-gray-500"> - {item.size}</span>}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
                      S/ {item.total.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-pink-200 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>S/ {order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Descuento{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                  <span>- S/ {order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>{order.delivery_method === 'pickup' ? 'Recojo en tienda' : 'Envío'}</span>
                <span>
                  {order.delivery_method === 'pickup' ? 'Sin costo' : `S/ ${order.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-800">
                <span>Total</span>
                <span className="text-pink-600">S/ {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <p className="font-semibold text-gray-800">
                {order.delivery_method === 'pickup' ? 'Recojo en tienda' : 'Dirección de envío'}
              </p>
              <span className="text-xs font-semibold text-[#1B66D0] bg-[#E7EBFE] px-2.5 py-1 rounded-full">
                {order.delivery_method_label}
              </span>
            </div>
            <p className="text-gray-600 text-sm">{order.shipping_fullname}</p>
            {order.shipping_phone && (
              <p className="text-gray-600 text-sm">Tel: {order.shipping_phone}</p>
            )}
            {order.delivery_method === 'shipping' ? (
              <>
                <p className="text-gray-600 text-sm">
                  {order.shipping_address_full ??
                    [order.shipping_address, order.shipping_address_number, order.shipping_city]
                      .filter(Boolean)
                      .join(', ')}
                </p>
                {order.shipping_latitude !== null && order.shipping_longitude !== null && (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${order.shipping_latitude}&mlon=${order.shipping_longitude}#map=18/${order.shipping_latitude}/${order.shipping_longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm font-semibold text-[#1B66D0] hover:text-[#1558B8]"
                  >
                    Ver ubicación en el mapa
                  </a>
                )}
                {order.shipping_notes && (
                  <p className="text-gray-600 text-sm mt-3">
                    <span className="font-medium">Instrucciones de envío:</span> {order.shipping_notes}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-600 text-sm mt-1">
                Te avisaremos cuando tu pedido esté listo para recoger.
              </p>
            )}
          </div>

          {(order.gift_wrap || order.gift_message) && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 text-left mb-8">
              <p className="font-semibold text-gray-800 mb-2">🎁 Detalles del regalo</p>
              {order.gift_wrap && (
                <p className="text-gray-600 text-sm">Envoltura para regalo incluida.</p>
              )}
              {order.gift_message && (
                <p className="text-gray-600 text-sm mt-1 italic">&ldquo;{order.gift_message}&rdquo;</p>
              )}
            </div>
          )}

          {!isPaid && !isCancelled && (
            <div className="mb-8">
              {paymentNotice && PAYMENT_STATUS_LABEL[paymentNotice] && (
                <div
                  className={`${STATUS_TONE[paymentNotice] ?? 'bg-gray-50 border-gray-200 text-gray-700'} border px-4 py-3 rounded-2xl text-sm font-medium mb-4`}
                >
                  {PAYMENT_STATUS_LABEL[paymentNotice]}
                </div>
              )}
              {payError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm mb-4">
                  {payError}
                </div>
              )}
              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#287FF0] hover:bg-[#1B66D0] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98]"
              >
                {paying ? 'Redirigiendo a Mercado Pago...' : 'Pagar ahora'}
              </button>
              {cancelError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm mt-4">
                  {cancelError}
                </div>
              )}
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full mt-3 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 transition-colors"
              >
                {cancelling ? 'Cancelando pedido...' : 'Cancelar pedido'}
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-[#72B992] hover:bg-[#5EA57E] active:bg-[#4A8A67] text-white font-semibold px-8 py-3 rounded-full shadow-lg shadow-[#72B992]/30 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Seguir comprando
            </Link>
            {isAuthenticated && (
              <Link
                href="/orders"
                className="bg-[#7CBF9C] hover:bg-[#8BCFA9] active:bg-[#5EA57E] text-gray-700 font-semibold px-8 py-3 rounded-full transition-all active:scale-[0.98]"
              >
                Ver mis pedidos
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
