'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getOrder, getPaymentStatus, createPreference, cancelOrderApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Order } from '@/types';

interface ApiError extends Error {
  status?: number;
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const paymentNotice = searchParams.get('status');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    getOrder(Number(id))
      .then(res => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar tu pedido');
        setLoading(false);
      });
  }, [id, isAuthenticated, authLoading]);

  useEffect(() => {
    if (!order || order.status !== 'pending') return;
    const timer = setInterval(() => {
      getPaymentStatus(Number(id))
        .then(res => setOrder(res.data))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  }, [order, id]);

  async function handlePay() {
    setPaying(true);
    setPayError('');
    try {
      const preference = await createPreference(Number(id));
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
      const res = await cancelOrderApi(Number(id));
      setOrder(res.data);
    } catch (err) {
      const error = err as ApiError;
      setCancelError(error.message || 'No se pudo cancelar el pedido');
    } finally {
      setCancelling(false);
    }
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

          <div className="bg-pink-50 rounded-2xl p-6 text-left mb-8">
            <p className="font-semibold text-gray-800 mb-4">Resumen del pedido</p>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between gap-4">
                  <span className="text-gray-700 text-sm">
                    {item.quantity} x {item.product_name}
                    {item.color && <span className="text-gray-500"> ({item.color})</span>}
                    {item.size && <span className="text-gray-500"> - {item.size}</span>}
                  </span>
                  <span className="text-sm font-medium text-gray-800">S/ {item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-pink-200 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>S/ {order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Envío</span>
                <span>S/ {order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800">
                <span>Total</span>
                <span className="text-pink-600">S/ {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8">
            <p className="font-semibold text-gray-800 mb-2">Dirección de envío</p>
            <p className="text-gray-600 text-sm">
              {order.shipping_fullname} · {order.shipping_city}
            </p>
            <p className="text-gray-600 text-sm">{order.shipping_address}</p>
            {order.shipping_phone && (
              <p className="text-gray-600 text-sm">Tel: {order.shipping_phone}</p>
            )}
          </div>

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
              className="bg-[#287FF0] hover:bg-[#1B66D0] text-white font-semibold px-8 py-3 rounded-full transition-all"
            >
              Seguir comprando
            </Link>
            <Link
              href="/orders"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-full transition-all"
            >
              Ver mis pedidos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
