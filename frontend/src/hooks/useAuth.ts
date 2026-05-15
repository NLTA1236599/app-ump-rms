import { useCallback, useEffect, useState } from 'react';
import { authService } from '../services/index.js';
import type { User } from '../types/index.js';

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

  const login = useCallback(async (username: string, password: string) => {
    try {
      const { token, user: u } = await authService.login(username, password);
      localStorage.setItem('auth_token', token);
      setUser(u);
      return { ok: true as const };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Sign in failed.';
      return { ok: false as const, message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
  }, []);

  return { user, isLoading, login, logout };
}
