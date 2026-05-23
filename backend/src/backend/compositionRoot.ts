import { pool } from '../config/database.js';
import { AuthApplicationService } from './application/authApplicationService.js';
import type { IAuthService } from './contracts/authService.js';
import { BcryptPasswordHasher } from './infrastructure/bcryptPasswordHasher.js';
import { JwtTokenSigner } from './infrastructure/jwtTokenSigner.js';
import { PgAuthUserRepository } from './infrastructure/pgAuthUserRepository.js';

/** Wire concrete adapters once — entry point for DI-style composition (guide §4 Step 5–6, adapted to Node). */
export function createAuthService(): IAuthService {
  const users = new PgAuthUserRepository(pool);
  const passwords = new BcryptPasswordHasher();
  const tokens = new JwtTokenSigner();
  return new AuthApplicationService(users, passwords, tokens);
}

/** Shared singleton for Express handlers (no per-request allocation). */
export const authService: IAuthService = createAuthService();
