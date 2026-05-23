/** Hashing abstraction — SRP: swap bcrypt without touching auth use-case (guide §3 S / D). */
export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
