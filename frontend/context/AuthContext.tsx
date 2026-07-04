'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import api, { unwrap, getToken, setToken, removeToken } from '@/lib/api';
import type { AuthResponse, LoginRequest, Role } from '@/lib/types';

interface CurrentUser {
  userId: number;
  fullName: string;
  email: string;
  roles: Role[];
  employeeId?: number | null;
}

interface AuthContextValue {
  user: CurrentUser | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const USER_KEY = 'ems_user';
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const token = getToken();
      const stored = localStorage.getItem(USER_KEY);
      if (token && stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      removeToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const data = await unwrap<AuthResponse>(api.post('/auth/login', credentials));

    setToken(data.accessToken);

    const currentUser: CurrentUser = {
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      roles: data.roles,
      employeeId: data.employeeId ?? null,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    setUser(currentUser);

    await new Promise(resolve => setTimeout(resolve, 100));
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    router.push('/login');
  }, [router]);

  const hasRole = useCallback((...roles: Role[]) => {
    if (!user) return false;
    return roles.some((r) => user.roles.includes(r));
  }, [user]);

  const value = useMemo(
    () => ({ user, isLoading, login, logout, hasRole }),
    [user, isLoading, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
