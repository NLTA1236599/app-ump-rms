import type { User } from '../../types/index.js';

/** Application port consumed by HTTP adapters (guide §3 D — controller depends on abstraction). */
export interface IAuthService {
  register(username: string, password: string, role: string, displayName?: string): Promise<User>;
  login(username: string, password: string): Promise<{ token: string; user: User }>;
  getProfile(userId: string): Promise<User | null>;
}
