import { useCallback, useEffect, useState } from 'react';
import { authService } from '../services/index.js';
import { ApiHttpError } from '../services/api/httpClient.js';
import type { User } from '../types/index.js';

export type AuthLoginResult =
  | { ok: true }
  | { ok: false; message: string; code?: 'email_unverified' };

export type AuthRegisterResult = { ok: true } | { ok: false; message: string };

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getProfile(token)
      .then((r) => setUser(r.user))
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<AuthLoginResult> => {
    try {
      const { token, user: u } = await authService.login(username, password);
      localStorage.setItem('auth_token', token);
      setUser(u);
      return { ok: true };
    } catch (e) {
      if (e instanceof ApiHttpError && e.status === 403) {
        return { ok: false, code: 'email_unverified', message: e.message };
      }
      const message = e instanceof Error ? e.message : 'Đăng nhập thất bại.';
      return { ok: false, message };
    }
  }, []);

  const register = useCallback(
    async (
      username: string,
      password: string,
      role: string,
      displayName?: string
    ): Promise<AuthRegisterResult> => {
      try {
        await authService.register(username, password, role, displayName);
        return { ok: true };
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Đăng ký thất bại.';
        return { ok: false, message };
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
  }, []);

  return { user, isLoading, login, register, logout };
}
