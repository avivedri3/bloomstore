import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthPayload, PublicUser } from '@bloomstore/shared-types';
import { api, unwrap } from '../services/api';

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = (payload: AuthPayload) => {
    localStorage.setItem('bloomstore.token', payload.accessToken);
    setUser(payload.user);
  };

  useEffect(() => {
    const token = localStorage.getItem('bloomstore.token');
    if (!token) {
      setLoading(false);
      return;
    }
    unwrap<PublicUser>(api.get('/auth/me'))
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('bloomstore.token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    persist(await unwrap<AuthPayload>(api.post('/auth/login', { email, password })));
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    persist(await unwrap<AuthPayload>(api.post('/auth/register', { fullName, email, password })));
  }, []);

  const logout = useCallback(async () => {
    try {
      await unwrap(api.post('/auth/logout'));
    } catch {
      /* token may already be invalid */
    }
    localStorage.removeItem('bloomstore.token');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
