import jwt from 'jsonwebtoken';
import type { User } from '../../types/index.js';
import { getJwtSecret } from '../config/jwt.js';
import type { ITokenSigner } from '../contracts/tokenSigner.js';

export class JwtTokenSigner implements ITokenSigner {
  signForUser(user: Pick<User, 'id' | 'username' | 'role'>): string {
    const payload = {
      id: String(user.id),
      username: String(user.username),
      role: String(user.role),
    };
    return jwt.sign(payload, getJwtSecret(), { expiresIn: '8h' });
  }
}
