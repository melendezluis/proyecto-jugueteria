'use client';

import { useState, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfileApi, changePasswordApi } from '@/services/api';

function getFirstErrors(err: unknown): Record<string, string> {
  const errors = (err as { errors?: Record<string, string[]> })?.errors;
  if (!errors) return {};
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [field, messages[0]])
  );
}

function FloatingField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder=" "
          autoComplete={autoComplete}
          className={`w-full px-4 py-3 pt-5 border-2 bg-[#F8F9FA] rounded-xl focus:outline-none text-[#2B2D42] transition-all duration-200 ${
            error
              ? 'border-red-300 ring-2 ring-red-100'
              : focused
                ? 'border-[#e9ff70] ring-2 ring-[#e9ff70]/40'
                : active
                  ? 'border-[#e9ff70]'
                  : 'border-gray-300'
          }`}
        />
        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
            active ? 'text-xs -top-2.5 font-semibold' : 'text-gray-500 top-3.5 text-base'
          } ${error ? 'text-red-400' : active ? 'text-[#219EBC]' : ''}`}
        >
          {label}
        </label>
      </div>
      {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
    </div>
  );
}

export default function PerfilPage() {
  const { user, loading, isAuthenticated, updateUser } = useAuth();
  const router = useRouter();

  // Datos personales
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [seededUserId, setSeededUserId] = useState<number | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileFieldErrors, setProfileFieldErrors] = useState<Record<string, string>>({});

  // Cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Rellena el formulario cuando el usuario termina de cargar (patrón de ajuste en render)
  if (user && seededUserId !== user.id) {
    setSeededUserId(user.id);
    setName(user.name);
    setEmail(user.email);
  }

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileFieldErrors({});
    setProfileSaving(true);
    try {
      const res = await updateProfileApi(name.trim(), email.trim());
      updateUser({ id: res.data.id, name: res.data.name, email: res.data.email });
      setProfileSuccess(res.message);
    } catch (err) {
      setProfileError((err as Error).message || 'No se pudo actualizar el perfil');
      setProfileFieldErrors(getFirstErrors(err));
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordFieldErrors({ password_confirmation: 'Las contraseñas no coinciden.' });
      return;
    }

    setPasswordFieldErrors({});
    setPasswordSaving(true);
    try {
      const res = await changePasswordApi(currentPassword, newPassword, confirmPassword);
      setPasswordSuccess(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError((err as Error).message || 'No se pudo cambiar la contraseña');
      setPasswordFieldErrors(getFirstErrors(err));
    } finally {
      setPasswordSaving(false);
    }
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <p className="text-gray-500 animate-pulse">Cargando tu perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-10 px-6">
      <div className="max-w-5xl mx-auto">
        {/* ENCABEZADO */}
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
          <h1 className="font-kaushan text-3xl text-[#2B2D42]">Mi perfil</h1>
          <p className="text-[#2B2D42]/70 mt-2">Administra tus datos y tu contraseña.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* TARJETA: DATOS PERSONALES */}
          <form
            onSubmit={handleProfileSubmit}
            className="bg-white rounded-3xl shadow-sm p-8 space-y-6 border-t-4 border-[#6EBA92]"
          >
            <div>
              <h2 className="text-xl font-bold text-[#2B2D42]">Datos personales</h2>
              <p className="text-sm text-gray-500 mt-1">Actualiza tu nombre o correo electrónico.</p>
            </div>

            {profileSuccess && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                ✓ {profileSuccess}
              </div>
            )}
            {profileError && !Object.keys(profileFieldErrors).length && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                {profileError}
              </div>
            )}

            <FloatingField
              id="name"
              label="Nombre completo"
              value={name}
              onChange={setName}
              error={profileFieldErrors.name}
              autoComplete="name"
            />

            <FloatingField
              id="email"
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={setEmail}
              error={profileFieldErrors.email}
              autoComplete="email"
            />

            <button
              type="submit"
              disabled={profileSaving}
              className="w-full bg-[#219EBC] hover:bg-[#1B7F99] disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-2xl transition-all"
            >
              {profileSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>

          {/* TARJETA: CAMBIAR CONTRASEÑA */}
          <form
            onSubmit={handlePasswordSubmit}
            className="bg-white rounded-3xl shadow-sm p-8 space-y-6 border-t-4 border-[#F5B402]"
          >
            <div>
              <h2 className="text-xl font-bold text-[#2B2D42]">Cambiar contraseña</h2>
              <p className="text-sm text-gray-500 mt-1">Usa al menos 8 caracteres.</p>
            </div>

            {passwordSuccess && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                ✓ {passwordSuccess}
              </div>
            )}
            {passwordError && !Object.keys(passwordFieldErrors).length && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                {passwordError}
              </div>
            )}

            <FloatingField
              id="current_password"
              label="Contraseña actual"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              error={passwordFieldErrors.current_password}
              autoComplete="current-password"
            />

            <FloatingField
              id="new_password"
              label="Nueva contraseña"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              error={passwordFieldErrors.password}
              autoComplete="new-password"
            />

            <FloatingField
              id="confirm_password"
              label="Confirmar nueva contraseña"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={passwordFieldErrors.password_confirmation}
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={passwordSaving || newPassword.length < 8}
              className="w-full bg-[#F5B402] hover:bg-[#FFCA38] disabled:bg-gray-300 disabled:hover:bg-gray-300 text-[#2B2D42] font-semibold py-3.5 rounded-2xl transition-all"
            >
              {passwordSaving ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-[#2B2D42]/70">
          <Link href="/" className="text-[#219EBC] hover:text-[#1B7F99] font-medium">
            ← Volver a la tienda
          </Link>
        </p>
      </div>
    </div>
  );
}
