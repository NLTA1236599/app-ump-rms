/**
 * In-process smoke test for OTP registration (no HTTP / port conflicts with Docker).
 * Usage: npx tsx src/scripts/smokeOtpRegistration.ts
 */
import '../config/env.js';
import { pool } from '../config/database.js';
import { createAuthService } from '../backend/compositionRoot.js';
import { GENERIC_REGISTER_MSG } from '../backend/application/authApplicationService.js';
import { validatePassword } from '../modules/auth/passwordPolicy.js';

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

function assertPasswordPolicy() {
  const weak = ['abcdefgh', 'Abcdefg1', 'abcdefg1!'];
  for (const p of weak) {
    const r = validatePassword(p, 'user@ump.edu.vn');
    if (r.ok) throw new Error(`password policy accepted weak password: ${p}`);
  }
  const strong = validatePassword('Abcdef1!', 'user@ump.edu.vn');
  if (!strong.ok) throw new Error(`password policy rejected valid password: ${strong.message}`);
  const localLeak = validatePassword('User@ump1', 'user@ump.edu.vn');
  if (localLeak.ok) throw new Error('password policy allowed email local-part in password');
  console.log('OK password policy');
}

async function main() {
  assertPasswordPolicy();

  const auth = createAuthService();
  const email = `otp.smoke.${Date.now()}@ump.edu.vn`;
  const password = 'Abcdef1!';

  const reg = await auth.register(email, password, 'OTP Smoke');
  if (reg.message !== GENERIC_REGISTER_MSG) throw new Error(`register message mismatch: ${reg.message}`);
  console.log('OK register');

  const again = await auth.register(email, password, 'OTP Smoke');
  if (again.message !== GENERIC_REGISTER_MSG) throw new Error('duplicate register message mismatch');
  console.log('OK register duplicate (same message)');

  await expectReject('login unverified', () => auth.login(email, password), 403);
  await expectReject('wrong otp', () => auth.verifyOtp(email, '000000'), 400);

  const { rows: userRows } = await pool.query<{ id: string }>(
    `SELECT id FROM users WHERE username = $1`,
    [email]
  );
  const userId = userRows[0]?.id;
  if (!userId) throw new Error('registered user missing');

  const { rows } = await pool.query<{ otp_hash: string }>(
    `SELECT otp_hash FROM registration_otp_codes
     WHERE user_id = $1 AND used_at IS NULL
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  if (!rows[0]) throw new Error('no pending OTP row');

  const { createHash } = await import('node:crypto');
  const known = '123456';
  const knownHash = createHash('sha256').update(known, 'utf8').digest('hex');
  await pool.query(
    `UPDATE registration_otp_codes
     SET otp_hash = $1, failed_attempts = 0, expires_at = NOW() + INTERVAL '10 minutes', used_at = NULL
     WHERE user_id = $2 AND used_at IS NULL`,
    [knownHash, userId]
  );

  await auth.verifyOtp(email, known);
  console.log('OK verify');

  const login = await auth.login(email, password);
  if (!login.token) throw new Error('token missing');
  console.log('OK login after verify');

  await expectReject('wrong password', () => auth.login(email, 'Wrongpass1!'), 401);
  await expectReject('wrong password 2', () => auth.login(email, 'Wrongpass1!'), 401);
  await expectReject('wrong password 3', () => auth.login(email, 'Wrongpass1!'), 401);
  await expectReject('wrong password 4', () => auth.login(email, 'Wrongpass1!'), 401);
  await expectReject('wrong password 5', () => auth.login(email, 'Wrongpass1!'), 401);
  await expectReject('locked', () => auth.login(email, 'Wrongpass1!'), 401);
  const { rows: lockRows } = await pool.query<{ locked_until: Date | null }>(
    `SELECT locked_until FROM users WHERE id = $1`,
    [userId]
  );
  if (!lockRows[0]?.locked_until) throw new Error('expected locked_until after 5 failures');
  console.log('OK login lockout');

  await pool.query(
    `UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1`,
    [userId]
  );
  const unlocked = await auth.login(email, password);
  if (!unlocked.token) throw new Error('login after unlock failed');
  console.log('OK login reset after unlock');

  const email2 = `otp.resend.${Date.now()}@ump.edu.vn`;
  await auth.register(email2, password, 'Resend');
  const resend = await auth.resendOtp(email2, '127.0.0.1');
  if (!resend.emailVerificationRequired) throw new Error('resend envelope missing');
  console.log('OK resend');

  await expectReject('bad domain', () => auth.register('a@gmail.com', password), 400);
  await expectReject('weak password', () => auth.register(`weak.${Date.now()}@ump.edu.vn`, 'password123'), 400);

  console.log('SMOKE_ALL_PASSED');
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
