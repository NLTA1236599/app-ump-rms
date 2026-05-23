import bcrypt from 'bcryptjs';
import type { IPasswordHasher } from '../contracts/passwordHasher.js';

const SALT_ROUNDS = 12;

export class BcryptPasswordHasher implements IPasswordHasher {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash).catch(() => false);
  }
}
