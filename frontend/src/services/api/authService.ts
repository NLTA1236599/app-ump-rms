import { httpClient } from './httpClient.js';
import type { IAuthService } from '../interfaces/IAuthService.js';
import type { User } from '../../types/index.js';

export class ApiAuthService implements IAuthService {
  async login(username: string, password: string) {
    return httpClient.post<{ token: string; user: User }>('/auth/login', {
      username,
      password,
    });
  }

  async register(username: string, password: string, role: string, displayName?: string) {
    return httpClient.post<{ user: User }>('/auth/register', {
      username,
      password,
      role,
      displayName,
    });
  }

  async getProfile(token: string) {
    return httpClient.get<{ user: User }>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
