'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrders } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Order } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
    if (isAuthenticated) {
      getOrders()
        .then(res => setOrders(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-2xl text-gray-500 animate-pulse">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Mis pedidos</h1>
          <Link
            href="/"
            className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            Seguir comprando
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500 animate-pulse">Cargando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl">
            <span className="text-6xl block mb-4">📦</span>
            <p className="text-2xl text-gray-600 mb-4">Aún no tienes pedidos</p>
            <Link
              href="/"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-full transition-all"
            >
              Ver juguetes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-3xl shadow-sm p-6">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${STATUS_COLORS[order.status]}`}>
                    {order.status_label}
                  </span>
                  <p className="text-lg font-bold text-orange-600">S/ {order.total.toFixed(2)}</p>
                </div>
                <div className="border-t pt-4 space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm gap-4">
                      <span className="text-gray-600">
                        {item.quantity} x {item.product_name}
                        {item.color && <span className="text-gray-400"> ({item.color})</span>}
                        {item.size && <span className="text-gray-400"> - {item.size}</span>}
                      </span>
                      <span className="font-medium text-gray-800">S/ {item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
