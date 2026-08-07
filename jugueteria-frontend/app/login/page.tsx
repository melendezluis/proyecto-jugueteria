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
      <div className="login-form-container">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="relative w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-blue-600 bg-white flex-shrink-0">
              <Image
                src="/images/gato20.png"
                alt="Logo jugueteria el gato"
                fill
                className="object-contain rounded-full"
                priority
              />
            </div>
            
            <h1 className="text-3xl font-bold text-blue-600">El Gato</h1>
            <p className="text-gray-500 mt-2">Ingrese su correo y contraseña para iniciar sesión.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm p-8 space-y-6">
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
                className={`w-full px-4 py-3 pt-5 border-2 rounded-xl focus:outline-none text-gray-800 transition-all duration-200 ${
                  isEmailFocused || email
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-300'
                }`}
                placeholder=" "
              />
              <label
                htmlFor="email"
                className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                  isEmailFocused || email
                    ? 'text-xs -top-2.5 text-blue-600 font-semibold'
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
                className={`w-full px-4 py-3 pt-5 border-2 rounded-xl focus:outline-none text-gray-800 transition-all duration-200 ${
                  isPasswordFocused || password
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-300'
                }`}
                placeholder=" "
              />
              <label
                htmlFor="password"
                className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                  isPasswordFocused || password
                    ? 'text-xs -top-2.5 text-blue-600 font-semibold'
                    : 'text-gray-500 top-3.5 text-base'
                }`}
              >
                Contraseña
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-400 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold py-4 rounded-2xl transition-all text-lg"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            <p className="text-center text-gray-500 text-sm">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-blue-600 hover:text-red-700 font-medium">
                Registrarse
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}