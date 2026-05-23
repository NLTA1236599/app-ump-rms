import type { User } from '../../types/index.js';
import type { IAuthService } from '../contracts/authService.js';
import type { IAuthUserRepository } from '../contracts/authUserRepository.js';
import type { IPasswordHasher } from '../contracts/passwordHasher.js';
import type { ITokenSigner } from '../contracts/tokenSigner.js';

function unauthorized(message: string): Error {
  const err = new Error(message);
  (err as Error & { status?: number }).status = 401;
  return err;
}

/**
 * Auth use-cases only — coordinates ports (guide §3 S: one reason to change = business rules for auth).
 */
export class AuthApplicationService implements IAuthService {
  constructor(
    private readonly users: IAuthUserRepository,
    private readonly passwords: IPasswordHasher,
    private readonly tokens: ITokenSigner
  ) {}

  async register(
    username: string,
    password: string,
    role: string,
    displayName?: string
  ): Promise<User> {
    const hash = await this.passwords.hash(password);
    return this.users.insertUser({
      username,
      passwordHash: hash,
      role,
      displayName: displayName ?? username,
    });
  }

  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const row = await this.users.findByUsername(username);
    if (!row) throw unauthorized('Tài khoản không tồn tại');

    if (typeof row.password !== 'string' || !row.password) {
      throw unauthorized('Mật khẩu không đúng');
    }

    const valid = await this.passwords.compare(password, row.password);
    if (!valid) throw unauthorized('Mật khẩu không đúng');

    const user: User = {
      id: String(row.id),
      username: String(row.username),
      role: String(row.role),
      displayName: row.display_name,
    };
    const token = this.tokens.signForUser(user);
    return { token, user };
  }

  getProfile(userId: string): Promise<User | null> {
    return this.users.findProfileById(userId);
  }
}
