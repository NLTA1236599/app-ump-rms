import { httpClient } from './httpClient.js';
import type {
  IAuthService,
  RegisterProfile,
  RegisterResponse,
  ResendOtpResponse,
} from '../interfaces/IAuthService.js';
import type { User } from '../../types/index.js';

export class ApiAuthService implements IAuthService {
  async login(username: string, password: string) {
    return httpClient.post<{ token: string; user: User }>('/auth/login', {
      username,
      password,
    });
  }

  async register(username: string, password: string, displayName?: string, profile?: RegisterProfile) {
    return httpClient.post<RegisterResponse>('/auth/register', {
      username,
      password,
      displayName,
      staffId: profile?.staffId,
      phone: profile?.phone,
      academicRank: profile?.academicRank,
      workUnit: profile?.workUnit,
      jobTitle: profile?.jobTitle,
      requestedRoles: profile?.requestedRoles,
    });
  }

  async verifyOtp(email: string, otp: string) {
    return httpClient.post<{ ok: boolean }>('/auth/verify-otp', { email, otp });
  }

  async resendOtp(email: string) {
    return httpClient.post<ResendOtpResponse>('/auth/resend-otp', { email });
  }

  async getProfile(token: string) {
    return httpClient.get<{ user: User }>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
