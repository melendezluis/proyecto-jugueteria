'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, passwordConfirmation);
    } catch (err) {
      setError((err as Error).message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 bg-[#F8F9FA]">
      <div className="w-full max-w-md">
        <div className="max-w-7xl mx-auto px-34 py-5 flex justify-between items-center">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#000000] bg-white flex-shrink-0">
                        <Image
                          src="/images/gato20.png"
                          alt="Logo jugueteria el gato"
                          fill
                          className="object-contain"
                          priority
                        />
                      </div>
          <div>
            <h1 className="font-kaushan text-3xl text-[#2B2D42]">El Gato</h1>
            <p className="text-sm text-[#2B2D42]/70 mt-1">Crea tu cuenta</p>
          </div>

        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm p-8 space-y-6 border-t-4 border-[#6EBA92]">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#2B2D42] mb-2">
              Nombre completo
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 bg-[#F8F9FA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6EBA92]/40 focus:border-[#6EBA92] text-[#2B2D42] placeholder:text-gray-400"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#2B2D42] mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 bg-[#F8F9FA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6EBA92]/40 focus:border-[#6EBA92] text-[#2B2D42] placeholder:text-gray-400"
              placeholder="tu@correo.com"
            />
            <p className="mt-1.5 text-xs font-medium text-[#219EBC]">
              Usaremos este correo para enviarte la confirmación de tu pedido
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#2B2D42] mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 bg-[#F8F9FA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6EBA92]/40 focus:border-[#6EBA92] text-[#2B2D42] placeholder:text-gray-400"
              placeholder="Mínimo 8 caracteres"
            />
            <p className={`mt-1.5 text-xs font-medium ${password.length >= 8 ? 'text-[#06D6A0]' : 'text-[#219EBC]'}`}>
              {password.length >= 8 ? '✓ Contraseña válida' : 'La contraseña debe tener al menos 8 caracteres'}
            </p>
          </div>

          <div>
            <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-[#2B2D42] mb-2">
              Confirmar contraseña
            </label>
            <input
              id="passwordConfirmation"
              type="password"
              value={passwordConfirmation}
              onChange={e => setPasswordConfirmation(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 bg-[#F8F9FA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6EBA92]/40 focus:border-[#6EBA92] text-[#2B2D42] placeholder:text-gray-400"
              placeholder="Repite la contraseña"
            />
            {passwordConfirmation.length > 0 && (
              <p className={`mt-1.5 text-xs font-medium ${password === passwordConfirmation ? 'text-[#06D6A0]' : 'text-red-500'}`}>
                {password === passwordConfirmation ? '✓ Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#219EBC] hover:bg-[#1B7F99] disabled:bg-gray-300 text-white font-semibold py-4 rounded-2xl transition-all text-lg"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className="text-center text-[#2B2D42]/70 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-[#219EBC] hover:text-[#1B7F99] font-medium">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
