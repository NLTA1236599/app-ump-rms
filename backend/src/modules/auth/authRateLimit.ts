/**
 * In-process rolling-window rate limits for OTP resend (single replica).
 * Per email: 5 / hour; per IP: 30 / hour.
 */

type Bucket = number[];

const emailBuckets = new Map<string, Bucket>();
const ipBuckets = new Map<string, Bucket>();

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_EMAIL = 5;
const MAX_PER_IP = 30;

function prune(bucket: Bucket, now: number): Bucket {
  return bucket.filter((t) => now - t < WINDOW_MS);
}

function retryAfterSeconds(bucket: Bucket, now: number): number {
  const oldest = bucket[0] ?? now;
  return Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
}

export type ResendRateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function checkResendRateLimit(email: string, ip: string): ResendRateLimitResult {
  const now = Date.now();
  const emailKey = email.trim().toLowerCase();
  const ipKey = ip || 'unknown';

  const emailBucket = prune(emailBuckets.get(emailKey) ?? [], now);
  if (emailBucket.length >= MAX_PER_EMAIL) {
    emailBuckets.set(emailKey, emailBucket);
    return { ok: false, retryAfterSeconds: retryAfterSeconds(emailBucket, now) };
  }

  const ipBucket = prune(ipBuckets.get(ipKey) ?? [], now);
  if (ipBucket.length >= MAX_PER_IP) {
    ipBuckets.set(ipKey, ipBucket);
    return { ok: false, retryAfterSeconds: retryAfterSeconds(ipBucket, now) };
  }

  emailBucket.push(now);
  ipBucket.push(now);
  emailBuckets.set(emailKey, emailBucket);
  ipBuckets.set(ipKey, ipBucket);
  return { ok: true };
}
