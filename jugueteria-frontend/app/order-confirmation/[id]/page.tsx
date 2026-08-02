'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getOrder, getPaymentStatus, createPreference } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Order } from '@/types';

interface ApiError extends Error {
  status?: number;
}

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  success: 'Tu pago fue procesado correctamente.',
  pending: 'Tu pago está en proceso. Te avisaremos apenas se confirme.',
  failure: 'El pago no se completó. Puedes intentarlo nuevamente.',
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
        <Link href="/" className="text-orange-600 hover:text-orange-700 font-medium text-lg">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  const isPaid = order.status === 'paid';

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <div className="bg-white rounded-3xl shadow-sm p-10">
          <span className="text-7xl block mb-6">{isPaid ? '🎉' : '🧸'}</span>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {isPaid ? '¡Pago confirmado!' : '¡Gracias por tu compra!'}
          </h1>
          <p className="text-gray-500 mb-6">
            Tu pedido <span className="font-semibold text-orange-600">{order.order_number}</span> ha sido
            registrado con éxito.
          </p>

          {isPaid && (
            <div className="bg-green-50 text-green-700 rounded-2xl p-4 mb-6 font-medium">
              Tu pago fue confirmado. Pronto procesaremos tu envío.
            </div>
          )}

          {!isPaid && (
            <div className="bg-amber-50 rounded-2xl p-6 mb-6">
              <p className="font-semibold text-amber-800 mb-1">Tu pedido está pendiente de pago</p>
              <p className="text-amber-700 text-sm mb-4">
                Completa el pago con Yape, Plin, tarjeta u otro medio para confirmar tu compra.
              </p>
              {payError && <p className="text-red-600 text-sm mb-3">{payError}</p>}
              <button
                onClick={handlePay}
                disabled={paying}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold px-8 py-3 rounded-full transition-all"
              >
                {paying ? 'Redirigiendo a Mercado Pago...' : 'Pagar ahora'}
              </button>
              <p className="text-amber-600 text-xs mt-3">
                Esta página se actualiza automáticamente cuando se confirma el pago.
              </p>
            </div>
          )}

          {paymentNotice && !isPaid && PAYMENT_STATUS_LABEL[paymentNotice] && (
            <div className="bg-blue-50 text-blue-700 rounded-2xl p-4 mb-6 text-sm font-medium">
              {PAYMENT_STATUS_LABEL[paymentNotice]}
            </div>
          )}

          <div className="bg-orange-50 rounded-2xl p-6 text-left mb-8">
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
            <div className="border-t border-orange-200 mt-4 pt-4 space-y-2">
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
                <span className="text-orange-600">S/ {order.total.toFixed(2)}</span>
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-full transition-all"
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
