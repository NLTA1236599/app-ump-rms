import type { User } from '../../types/index.js';

/** JWT minting only — SRP: change signing algorithm in one place (guide §3 S). */
export interface ITokenSigner {
  signForUser(user: Pick<User, 'id' | 'username' | 'role'>): string;
}
