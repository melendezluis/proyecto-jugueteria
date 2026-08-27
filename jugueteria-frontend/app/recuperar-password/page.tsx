'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { forgotPasswordApi } from '@/services/api';

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await forgotPasswordApi(email.trim());
      setSent(true);
      setMessage(res.message);
    } catch (err) {
      setError((err as Error).message || 'No se pudo enviar el correo de recuperación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="relative w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-black bg-white flex-shrink-0 mb-3">
            <Image
              src="/images/gato20.png"
              alt="Logo jugueteria el gato"
              fill
              className="object-contain rounded-full"
              sizes="56px"
            />
          </div>
          <h1 className="font-kaushan text-3xl text-[#2B2D42]">Recuperar contraseña</h1>
          <p className="text-[#2B2D42]/70 mt-2">
            Te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-sm p-8 space-y-6 border-t-4 border-[#e9ff70]"
        >
          {sent ? (
            <>
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                ✓ {message}
              </div>
              <p className="text-sm text-gray-500">
                Revisa tu bandeja de entrada (y la carpeta de spam). El enlace es válido por 60
                minutos.
              </p>
            </>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder=" "
                  className="peer w-full px-4 py-3 pt-5 border-2 bg-[#F8F9FA] rounded-xl focus:outline-none focus:border-[#e9ff70] focus:ring-2 focus:ring-[#e9ff70]/40 text-[#2B2D42] transition-all duration-200 border-gray-300"
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 transition-all duration-200 pointer-events-none peer-focus:text-xs peer-focus:-top-2.5 peer-focus:bg-white peer-focus:px-1 peer-focus:text-[#219EBC] peer-focus:font-semibold peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 text-gray-500 top-3.5 text-base"
                >
                  Correo electrónico
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#219EBC] hover:bg-[#1B7F99] disabled:bg-gray-300 text-white font-semibold py-4 rounded-2xl transition-all text-lg"
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </>
          )}

          <p className="text-center text-[#2B2D42]/70 text-sm">
            <Link href="/login" className="text-[#219EBC] hover:text-[#1B7F99] font-medium">
              ← Volver a iniciar sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
