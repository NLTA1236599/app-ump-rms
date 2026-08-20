import { useCallback, useEffect, useState } from 'react';
import { authService } from '../services/index.js';
import { ApiHttpError } from '../services/api/httpClient.js';
import type { OtpDeliveryChannel } from '../components/auth/registration/constants.js';
import type { User } from '../types/index.js';

export type AuthLoginResult =
  | { ok: true; user: User }
  | { ok: false; message: string; code?: 'email_unverified' };

export type AuthRegisterResult =
  | {
      ok: true;
      email: string;
      emailVerificationRequired: boolean;
      otpTtlSeconds: number;
      otpDeliveryChannel: OtpDeliveryChannel;
    }
  | { ok: false; message: string };

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('logout') === '1') {
      localStorage.removeItem('auth_token');
      setUser(null);
      setLoading(false);
      params.delete('logout');
      const query = params.toString();
      const nextUrl = query
        ? `${window.location.pathname}?${query}`
        : window.location.pathname;
      window.history.replaceState({}, '', nextUrl);
      return;
    }

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
      return { ok: true, user: u };
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
      displayName?: string
    ): Promise<AuthRegisterResult> => {
      try {
        const result = await authService.register(username, password, displayName);
        return {
          ok: true,
          email: username,
          emailVerificationRequired: result.emailVerificationRequired,
          otpTtlSeconds: result.otpTtlSeconds,
          otpDeliveryChannel: result.otpDeliveryChannel,
        };
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Đăng ký thất bại.';
        return { ok: false, message };
      }
    },
    []
  );

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    try {
      await authService.verifyOtp(email, otp);
      return { ok: true as const };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Xác minh OTP thất bại.';
      const alreadyVerified = e instanceof ApiHttpError && e.status === 409;
      return { ok: false as const, message, alreadyVerified };
    }
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    try {
      const result = await authService.resendOtp(email);
      return { ok: true as const, ...result };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gửi lại OTP thất bại.';
      return { ok: false as const, message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
  }, []);

  return { user, isLoading, login, register, verifyOtp, resendOtp, logout };
}
