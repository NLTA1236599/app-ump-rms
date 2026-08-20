import { createHash, randomInt, timingSafeEqual } from 'node:crypto';

/** Generate a cryptographically random 6-digit OTP (000000–999999). */
export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

/** Strip copy-paste noise (spaces, letter-spacing artifacts, zero-width chars). */
export function normalizeOtpInput(otp: string): string {
  return String(otp ?? '')
    .normalize('NFKC')
    .replace(/[^\d]/g, '');
}

export function hashOtp(otp: string): string {
  return createHash('sha256').update(otp, 'utf8').digest('hex');
}

/** Constant-time compare of SHA-256 hex digests. */
export function otpHashesEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    if (bufA.length === 0 || bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function isSixDigitOtp(otp: string): boolean {
  return /^\d{6}$/.test(normalizeOtpInput(otp));
}
