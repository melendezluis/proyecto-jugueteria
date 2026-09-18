'use client';

import { createContext, useContext, useState, useEffect, useCallback, useSyncExternalStore, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi, registerApi, logoutApi, getUserApi } from '@/services/api';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
}

const LOGOUT_EVENT = 'elgato-auth-logout';

const emptySubscribe = () => () => {};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  });
  const router = useRouter();

  // Snapshot del cliente antes/después de la hidratación. Durante SSR y el primer
  // render del cliente devuelve false, así servidor y cliente pintan el mismo
  // estado y no hay errores de hidratación por leer localStorage.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!token) return;
    getUserApi()
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      });
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginApi(email, password);
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    router.push('/');
  }, [router]);

  const register = useCallback(async (name: string, email: string, password: string, passwordConfirmation: string) => {
    const res = await registerApi(name, email, password, passwordConfirmation);
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    router.push('/');
  }, [router]);

  const logout = useCallback(async () => {
    try { await logoutApi(); } catch { }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event(LOGOUT_EVENT));
    router.push('/login');
  }, [router]);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  // Mientras no se haya montado (o mientras se resuelve la sesión) los guards
  // de las páginas (ej. `if (!authLoading && !isAuthenticated) redirect`) deben
  // bloquearse para no redirigir a /login con un token válido en almacenamiento.
  const loading = !mounted || (token !== null && user === null);
  const isAuthenticated = mounted && !!(token || user);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
