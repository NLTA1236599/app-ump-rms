import { pool } from '../config/database.js';
import { createEmailSender } from '../services/email/createEmailSender.js';
import { AuthApplicationService } from './application/authApplicationService.js';
import type { IAuthService } from './contracts/authService.js';
import { BcryptPasswordHasher } from './infrastructure/bcryptPasswordHasher.js';
import { JwtTokenSigner } from './infrastructure/jwtTokenSigner.js';
import { PgAuthUserRepository } from './infrastructure/pgAuthUserRepository.js';
import { PgRegistrationOtpRepository } from './infrastructure/pgRegistrationOtpRepository.js';

/** Wire concrete adapters once — entry point for DI-style composition (guide §4 Step 5–6, adapted to Node). */
export function createAuthService(): IAuthService {
  const users = new PgAuthUserRepository(pool);
  const otps = new PgRegistrationOtpRepository(pool);
  const passwords = new BcryptPasswordHasher();
  const tokens = new JwtTokenSigner();
  const mail = createEmailSender();
  return new AuthApplicationService(pool, users, otps, passwords, tokens, mail);
}

/** Shared singleton for Express handlers (no per-request allocation). */
export const authService: IAuthService = createAuthService();
