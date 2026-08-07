'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/types';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showStoreInfo, setShowStoreInfo] = useState(false);

  const { addItem } = useCart();

  useEffect(() => {
    getProductBySlug(slug)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Producto no encontrado');
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowStoreInfo(false);
      }
    };

    if (showStoreInfo) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [showStoreInfo]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="h-96 bg-gray-200 rounded-3xl" />
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <span className="text-6xl block mb-4">😿</span>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {error || 'Producto no encontrado'}
        </h2>
        <Link href="/" className="text-orange-600 hover:text-orange-700 font-medium text-lg">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  const images = product.images.length > 0
    ? product.images.sort((a, b) => a.position - b.position)
    : null;

  const hasOffer = product.offer_price !== null && product.offer_price < product.price;
  const mainImage = images?.[selectedImage];

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600 text-black">
            🏠 Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Imágenes */}
          <div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm mb-4">
              {mainImage ? (
                <img
                  src={mainImage.image_path}
                  alt={mainImage.alt_text || product.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-blue-400 to-blue-100 flex items-center justify-center text-9xl">
                  🧸
                </div>
              )}
            </div>
            {images && images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      i === selectedImage ? 'border-blue-500' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.image_path} alt={img.alt_text || ''} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Información del producto */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              {product.brand && (
                <span className="bg-gray-100 px-3 py-1 rounded-full">{product.brand.name}</span>
              )}
              {product.category && (
                <span className="bg-gray-100 px-3 py-1 rounded-full">{product.category.name}</span>
              )}
              {product.is_featured && (
                <span className="bg-[#EF5350] text-white px-3 py-1 rounded-full">Destacado</span>
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
            <div className="flex items-baseline gap-3 mb-6">
              {hasOffer ? (
                <>
                  <p className="text-4xl font-bold text-blue-600">S/ {product.offer_price!.toFixed(2)}</p>
                  <p className="text-2xl text-gray-400 line-through">S/ {product.price.toFixed(2)}</p>
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full">
                    -{Math.round((1 - product.offer_price! / product.price) * 100)}%
                  </span>
                </>
              ) : (
                <p className="text-4xl font-bold text-blue-500">S/ {product.price.toFixed(2)}</p>
              )}
            </div>

            <p className="text-gray-500 text-sm mb-2">
              Stock:{' '}
              {product.stock > 0 ? (
                <span className="text-blue-800 font-medium">{product.stock} unidades disponibles</span>
              ) : (
                <span className="text-red-600 font-medium">Agotado</span>
              )}
            </p>

            {product.short_description && (
              <p className="text-gray-600 text-lg mb-6">{product.short_description}</p>
            )}

            {product.description && (
              <div
                className="prose prose-gray max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            {product.variants.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Variantes</h3>
                <div className="space-y-2">
                  {product.variants.filter(v => v.is_active).map(variant => (
                    <div key={variant.id} className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm">
                      {variant.color && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Color:</span>
                          <span className="font-medium">{variant.color}</span>
                        </div>
                      )}
                      {variant.size && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Talla:</span>
                          <span className="font-medium">{variant.size}</span>
                        </div>
                      )}
                      {variant.price_extra > 0 && (
                        <span className="text-sm text-blue-600">+S/ {variant.price_extra.toFixed(2)}</span>
                      )}
                      <span className="text-sm text-gray-500 ml-auto">Stock: {variant.stock}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {product.material && (
                <div className="bg-blue-100 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Material</p>
                  <p className="font-medium text-gray-800">{product.material}</p>
                </div>
              )}
              {(product.age_from || product.age_to) && (
                <div className="bg-blue-100 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Edad recomendada</p>
                  <p className="font-medium text-gray-800">
                    {product.age_from}+ años
                    {product.age_to ? ` (hasta ${product.age_to} años)` : ''}
                  </p>
                </div>
              )}
              {product.sku && (
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500">SKU</p>
                  <p className="font-medium text-gray-800">{product.sku}</p>
                </div>
              )}
              {product.safety_info && (
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Seguridad</p>
                  <p className="font-medium text-gray-800">{product.safety_info}</p>
                </div>
              )}
            </div>

            <div className="mt-4 mb-5">
              <button
                onClick={() => setShowStoreInfo(true)}
                className="text-gray-500 hover:text-gray-800 underline underline-offset-4 transition-colors text-sm"
              >
                Ver información de la tienda
              </button>
            </div>

            <button
              onClick={() => addItem(product)}
              disabled={product.stock <= 0}
              className="w-full bg-[#287FF0] hover:bg-[#FF9F1C] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-5 rounded-2xl transition-all text-xl active:scale-95"
            >
              {product.stock > 0 ? '🛒 Agregar al carrito' : 'Producto agotado'}
            </button>
          </div>
        </div>
      </div>

      {/* Panel lateral de información de la tienda */}
      {showStoreInfo && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setShowStoreInfo(false)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto animate-[slideIn_0.3s_ease-out]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Información de la tienda</h3>
              <button
                onClick={() => setShowStoreInfo(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all text-3xl leading-none"
                aria-label="Cerrar información de la tienda"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="border border-gray-200 rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 text-lg leading-6 mb-4">Av. Buenos Aires 1209</h4>
                <div className="space-y-2 text-gray-600 text-sm">
                  <p>Av. Buenos Aires 1209</p>
                  <p>Chancay</p>
                  <p>PE-Huaral</p>
                  <p>+51 928 049 345</p>
                </div>
                <div className="border-t border-gray-200 mt-5 pt-5">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full border border-gray-400 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 text-sm">✓</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-6">
                      Retiro disponible, normalmente está listo
                      <br />
                      en 2 a 4 días
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}