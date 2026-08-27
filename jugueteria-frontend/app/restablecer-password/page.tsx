'use client';

import { Suspense, useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPasswordApi } from '@/services/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const invalidLink = !success && (!token || !email);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setFieldErrors({ password_confirmation: 'Las contraseñas no coinciden.' });
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      await resetPasswordApi(token, email, password, confirmPassword);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError((err as Error).message || 'No se pudo restablecer la contraseña');
      const errors = (err as { errors?: Record<string, string[]> })?.errors;
      if (errors) {
        setFieldErrors(
          Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]]))
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function fieldClasses(hasError?: boolean) {
    return `w-full px-4 py-3 pt-5 border-2 bg-[#F8F9FA] rounded-xl focus:outline-none text-[#2B2D42] transition-all duration-200 focus:border-[#e9ff70] ${
      hasError ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-300 focus:ring-2 focus:ring-[#e9ff70]/40'
    }`;
  }

  if (success) {
    return (
      <>
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
          ✓ Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva
          contraseña.
        </div>
        <p className="text-sm text-gray-500 text-center">
          Redirigiendo al inicio de sesión...
        </p>
        <p className="text-center text-[#2B2D42]/70 text-sm">
          <Link href="/login" className="text-[#219EBC] hover:text-[#1B7F99] font-medium">
            Ir ahora
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      {invalidLink ? (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
          El enlace no es válido. Solicita uno nuevo para continuar.
        </div>
      ) : (
        <p className="text-sm text-gray-500 -mt-2">
          Restableciendo la contraseña de{' '}
          <span className="font-semibold text-[#2B2D42]">{email}</span>
        </p>
      )}

      {error && !fieldErrors.password && !fieldErrors.email && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {token && email && (
        <>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder=" "
                autoComplete="new-password"
                className={fieldClasses(!!fieldErrors.password)}
              />
              <label
                htmlFor="password"
                className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                  password ? 'text-xs -top-2.5 font-semibold' : 'text-gray-500 top-3.5 text-base'
                } ${password ? 'text-[#219EBC]' : ''}`}
              >
                Nueva contraseña
              </label>
            </div>
            {fieldErrors.password && (
              <p className="text-red-500 text-xs -mt-3 ml-1">{fieldErrors.password}</p>
            )}

            <div className="relative">
              <input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder=" "
                autoComplete="new-password"
                className={fieldClasses(!!fieldErrors.password_confirmation)}
              />
              <label
                htmlFor="confirm_password"
                className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                  confirmPassword ? 'text-xs -top-2.5 font-semibold' : 'text-gray-500 top-3.5 text-base'
                } ${confirmPassword ? 'text-[#219EBC]' : ''}`}
              >
                Confirmar contraseña
              </label>
            </div>
            {fieldErrors.password_confirmation && (
              <p className="text-red-500 text-xs -mt-3 ml-1">
                {fieldErrors.password_confirmation}
              </p>
            )}
            {fieldErrors.email && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                {fieldErrors.email}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#219EBC] hover:bg-[#1B7F99] disabled:bg-gray-300 text-white font-semibold py-4 rounded-2xl transition-all text-lg"
            >
              {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400">
            La contraseña debe tener al menos 8 caracteres.
          </p>
        </>
      )}

      <p className={`text-center text-[#2B2D42]/70 text-sm ${invalidLink ? '' : '-mt-2'}`}>
        <Link href="/recuperar-password" className="text-[#219EBC] hover:text-[#1B7F99] font-medium">
          Solicitar un nuevo enlace
        </Link>
      </p>
    </>
  );
}

export default function RestablecerPasswordPage() {
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
          <h1 className="font-kaushan text-3xl text-[#2B2D42]">Restablecer contraseña</h1>
          <p className="text-[#2B2D42]/70 mt-2">Elige una nueva contraseña para tu cuenta.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8 space-y-6 border-t-4 border-[#e9ff70]">
          <Suspense
            fallback={<p className="text-center text-gray-500 animate-pulse">Cargando...</p>}
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
