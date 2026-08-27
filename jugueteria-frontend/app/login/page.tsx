'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError((err as Error).message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* LADO IZQUIERDO - IMAGEN */}
      <div className="login-image-container">
        <div className="login-image">
          <Image
            src="/images/jugueteria_banner_no_borders.png"
            alt="Juguetería El Gato"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* LADO DERECHO - FORMULARIO */}
      <div className="login-form-container mb-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-10">
  <div className="flex items-center gap-4">
    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#000000] bg-white flex-shrink-0">
      <Image
        src="/images/gato20.png"
        alt="Logo jugueteria el gato"
        fill
        className="object-contain rounded-full"
        priority
      />
    </div>
    <h1 className="font-kaushan text-3xl text-[#2B2D42]">El Gato</h1>
  </div>
  <p className="text-[#2B2D42]/70 text-sm mt-2">Ingrese su correo y contraseña para iniciar sesión.</p>
</div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm p-8 space-y-6 border-t-4 border-[#6EBA92]">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* CAMPO DE CORREO ELECTRÓNICO */}
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                required
                className={`w-full px-4 py-3 pt-5 border-2 bg-[#F8F9FA] rounded-xl focus:outline-none text-[#2B2D42] transition-all duration-200 ${
                  isEmailFocused || email
                    ? 'border-[#6EBA92] ring-2 ring-[#6EBA92]/40'
                    : 'border-gray-300'
                }`}
                placeholder=" "
              />
              <label
                htmlFor="email"
                className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                  isEmailFocused || email
                    ? 'text-xs -top-2.5 text-[#219EBC] font-semibold'
                    : 'text-gray-500 top-3.5 text-base'
                }`}
              >
                Correo electrónico
              </label>
            </div>

            {/* CAMPO DE CONTRASEÑA */}
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                required
                className={`w-full px-4 py-3 pt-5 border-2 bg-[#F8F9FA] rounded-xl focus:outline-none text-[#2B2D42] transition-all duration-200 ${
                  isPasswordFocused || password
                    ? 'border-[#6EBA92] ring-2 ring-[#6EBA92]/40'
                    : 'border-gray-300'
                }`}
                placeholder=" "
              />
              <label
                htmlFor="password"
                className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                  isPasswordFocused || password
                    ? 'text-xs -top-2.5 text-[#219EBC] font-semibold'
                    : 'text-gray-500 top-3.5 text-base'
                }`}
              >
                Contraseña
              </label>
            </div>

            <div className="flex justify-end -mt-2">
              <Link
                href="/recuperar-password"
                className="text-sm text-[#219EBC] hover:text-[#1B7F99] font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#219EBC] hover:bg-[#1B7F99] disabled:bg-gray-300 text-white font-semibold py-4 rounded-2xl transition-all text-lg"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

          <p className="text-center text-[#2B2D42]/70 text-sm">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-[#219EBC] hover:text-[#1B7F99] font-medium">
              Registrarse
            </Link>
          </p>
          </form>
        </div>
      </div>
    </div>
  );
}