/** Single source for JWT signing/verification secret (DIP: middleware + token service share config). */
export function getJwtSecret(): string {
  const fromEnv = process.env.JWT_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set to a non-empty value');
  }
  // `jsonwebtoken` throws if secret is "" — treat blank JWT_SECRET like unset (common .env mistake).
  return 'change-me-in-production';
}
