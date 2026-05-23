import type { User } from '../../types/index.js';

/** DB row including credential column — internal to persistence. */
export type AuthUserRow = {
  id: string;
  username: string;
  password: string;
  role: string;
  display_name: string | null;
};

/**
 * Persistence port for auth flows — ISP: login/register/profile only see DB ops they need (guide §3 I).
 */
export interface IAuthUserRepository {
  insertUser(input: {
    username: string;
    passwordHash: string;
    role: string;
    displayName: string | null;
  }): Promise<User>;
  findByUsername(username: string): Promise<AuthUserRow | null>;
  findProfileById(userId: string): Promise<User | null>;
}
