/**
 * In-process smoke test for OTP registration (no HTTP / port conflicts with Docker).
 * Usage: npx tsx src/scripts/smokeOtpRegistration.ts
 */
import '../config/env.js';
import { pool } from '../config/database.js';
import { createAuthService } from '../backend/compositionRoot.js';

async function expectReject(label: string, fn: () => Promise<unknown>, status: number) {
  try {
    await fn();
    throw new Error(`${label}: expected status ${status}`);
  } catch (e) {
    const s = (e as Error & { status?: number }).status;
    if (s !== status) throw new Error(`${label}: expected ${status}, got ${s}: ${(e as Error).message}`);
    console.log(`OK ${label} -> ${status}`);
  }
}

async function main() {
  const auth = createAuthService();
  const email = `otp.smoke.${Date.now()}@ump.edu.vn`;
  const password = 'password123';

  const reg = await auth.register(email, password, 'OTP Smoke');
  if (reg.user.role !== 'user') throw new Error(`role should be user, got ${reg.user.role}`);
  if (!reg.emailVerificationRequired) throw new Error('emailVerificationRequired missing');
  if (!reg.otpTtlSeconds) throw new Error('otpTtlSeconds missing');
  console.log('OK register', {
    role: reg.user.role,
    channel: reg.otpDeliveryChannel,
    ttl: reg.otpTtlSeconds,
  });

  await expectReject('login unverified', () => auth.login(email, password), 403);
  await expectReject('wrong otp', () => auth.verifyOtp(email, '000000'), 400);

  const { rows } = await pool.query<{ otp_hash: string }>(
    `SELECT otp_hash FROM registration_otp_codes
     WHERE user_id = $1 AND used_at IS NULL
     ORDER BY created_at DESC LIMIT 1`,
    [reg.user.id]
  );
  if (!rows[0]) throw new Error('no pending OTP row');

  // Brute-force find OTP by hashing (dev only; codes are 6 digits — too slow).
  // Instead re-issue via resend and capture plaintext through a second register path:
  // We read from a known hash by generating until match is impractical.
  // Use SQL to temporarily set a known OTP hash for verify.
  const { createHash } = await import('node:crypto');
  const known = '123456';
  const knownHash = createHash('sha256').update(known, 'utf8').digest('hex');
  await pool.query(
    `UPDATE registration_otp_codes
     SET otp_hash = $1, failed_attempts = 0, expires_at = NOW() + INTERVAL '10 minutes', used_at = NULL
     WHERE user_id = $2 AND used_at IS NULL`,
    [knownHash, reg.user.id]
  );

  await auth.verifyOtp(email, known);
  console.log('OK verify');

  const login = await auth.login(email, password);
  if (!login.token) throw new Error('token missing');
  console.log('OK login after verify');

  const email2 = `otp.resend.${Date.now()}@ump.edu.vn`;
  await auth.register(email2, password, 'Resend');
  const resend = await auth.resendOtp(email2, '127.0.0.1');
  if (!resend.otpTtlSeconds) throw new Error('resend ttl missing');
  console.log('OK resend', resend.otpDeliveryChannel);

  await expectReject('bad domain', () => auth.register('a@gmail.com', password), 400);

  // Client cannot escalate: register always user (already asserted).
  console.log('SMOKE_ALL_PASSED');
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
