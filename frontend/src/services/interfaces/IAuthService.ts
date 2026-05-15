import type { User } from '../../types/index.js';

export interface IAuthService {
  login(username: string, password: string): Promise<{ token: string; user: User }>;
  register(
    username: string,
    password: string,
    role: string,
    displayName?: string
  ): Promise<{ user: User }>;
  getProfile(token: string): Promise<{ user: User }>;
}
