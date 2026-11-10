import type { Pool } from 'pg';
import type { User } from '../../types/index.js';
import type { IEmailSender } from '../../services/email/IEmailSender.js';
import {
  registrationOtpHtml,
  registrationOtpSubject,
  registrationOtpText,
} from '../../services/email/templates/registrationOtpTemplate.js';
import {
  duplicateRegisterHtml,
  duplicateRegisterSubject,
  duplicateRegisterText,
} from '../../services/email/templates/duplicateRegisterTemplate.js';
import { checkResendRateLimit } from '../../modules/auth/authRateLimit.js';
import { validateInstitutionalEmail } from '../../modules/auth/institutionalEmail.js';
import { validatePassword } from '../../modules/auth/passwordPolicy.js';
import {
  getOtpMaxFailedAttempts,
  getOtpTtlMinutes,
  getOtpTtlSeconds,
  resolveConfiguredDeliveryChannel,
  type OtpDeliveryChannel,
} from '../../modules/auth/otpConfig.js';
import {
  generateOtpCode,
  hashOtp,
  isSixDigitOtp,
  normalizeOtpInput,
  otpHashesEqual,
} from '../../modules/auth/otpCrypto.js';
import type {
  IAuthService,
  RegisterResult,
  ResendOtpResult,
} from '../contracts/authService.js';
import type { AuthUserRow, IAuthUserRepository } from '../contracts/authUserRepository.js';
import type { IPasswordHasher } from '../contracts/passwordHasher.js';
import type { IRegistrationOtpRepository } from '../contracts/registrationOtpRepository.js';
import type { ITokenSigner } from '../contracts/tokenSigner.js';
import type { RegisterProfileInput } from '../../modules/auth/registerProfile.js';
import { emptyRegisterProfile } from '../../modules/auth/registerProfile.js';

function httpError(message: string, status: number): Error {
  const err = new Error(message);
  (err as Error & { status?: number }).status = status;
  return err;
}

const GENERIC_OTP_REJECT =
  'Mã OTP không hợp lệ hoặc đã hết hạn. Nếu vừa gửi lại mã, hãy nhập mã mới nhất trong email (kể cả thư rác).';
const OTP_EXPIRED_RESEND =
  'Mã OTP đã hết hạn hoặc chưa được gửi. Hãy bấm Gửi lại mã để nhận mã mới.';
const ALREADY_VERIFIED_MSG = 'Tài khoản đã được xác minh. Hãy đăng nhập.';
const OTP_MAIL_FAILED_MSG =
  'Không gửi được email OTP. Kiểm tra hộp thư rác hoặc thử lại sau ít phút.';
const UNVERIFIED_LOGIN_MSG =
  'Email chưa được xác minh. Vui lòng nhập mã OTP từ email hoặc gửi lại mã trong quy trình đăng ký.';
/** Same message for unknown user, wrong password, and lockout — prevents user enumeration (BUG-018 / T08). */
const INVALID_CREDENTIALS_MSG = 'Tên đăng nhập hoặc mật khẩu không đúng';
export const GENERIC_REGISTER_MSG =
  'Nếu thông tin hợp lệ, mã OTP đã được gửi tới email của bạn.';
/** Precomputed bcrypt hash used only to keep login timing similar when the user is missing. */
const DUMMY_PASSWORD_HASH =
  '$2a$12$QiILhFxpAoP7LUFd5Qm6o.JbNWZH4aTquq3smrsf4AjdFqcy10ftK';
const LOCKOUT_AFTER_FAILURES = 5;
const LOCKOUT_MINUTES = 15;

function isUniqueViolation(e: unknown): boolean {
  return Boolean(e && typeof e === 'object' && 'code' in e && (e as { code: unknown }).code === '23505');
}

/**
 * Auth use-cases only — coordinates ports (guide §3 S: one reason to change = business rules for auth).
 */
export class AuthApplicationService implements IAuthService {
  constructor(
    private readonly pool: Pool,
    private readonly users: IAuthUserRepository,
    private readonly otps: IRegistrationOtpRepository,
    private readonly passwords: IPasswordHasher,
    private readonly tokens: ITokenSigner,
    private readonly mail: IEmailSender
  ) {}

  async register(
    username: string,
    password: string,
    displayName?: string,
    profile?: RegisterProfileInput
  ): Promise<RegisterResult> {
    const emailResult = validateInstitutionalEmail(username);
    if (!emailResult.ok) {
      throw httpError(emailResult.message, 400);
    }
    const email = emailResult.normalized;

    const passwordResult = validatePassword(password, email);
    if (!passwordResult.ok) {
      throw httpError(passwordResult.message, 400);
    }

    const passwordHash = await this.passwords.hash(password);
    const existing = await this.users.findByUsername(email);
    if (existing) {
      void this.notifyExistingAccount(email);
      return { message: GENERIC_REGISTER_MSG };
    }

    const ttlMinutes = getOtpTtlMinutes();
    const plaintextOtp = generateOtpCode();
    const otpHash = hashOtp(plaintextOtp);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
    const registration = profile ?? emptyRegisterProfile();

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const user = await this.users.insertUser(
        {
          username: email,
          passwordHash,
          role: 'user',
          displayName: displayName?.trim() || email,
          emailVerified: false,
          staffId: registration.staffId,
          phone: registration.phone,
          academicRank: registration.academicRank,
          workUnit: registration.workUnit,
          jobTitle: registration.jobTitle,
          requestedRoles: registration.requestedRoles,
        },
        client
      );
      await this.otps.issueOtp(client, user.id, otpHash, expiresAt);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      if (isUniqueViolation(e)) {
        void this.notifyExistingAccount(email);
        return { message: GENERIC_REGISTER_MSG };
      }
      throw e;
    } finally {
      client.release();
    }

    void this.deliverOtp(email, plaintextOtp, ttlMinutes).then((channel) => {
      if (channel === 'smtp_failed') {
        console.warn('[Auth] OTP email failed after register; user can resend');
      }
    });

    return { message: GENERIC_REGISTER_MSG };
  }

  async verifyOtp(email: string, otp: string): Promise<void> {
    const emailResult = validateInstitutionalEmail(email);
    const code = normalizeOtpInput(otp);
    if (!emailResult.ok || !isSixDigitOtp(code)) {
      throw httpError(GENERIC_OTP_REJECT, 400);
    }

    const row = await this.resolveUserByEmail(emailResult.normalized);
    if (!row) {
      throw httpError(GENERIC_OTP_REJECT, 400);
    }
    if (row.email_verified) {
      throw httpError(ALREADY_VERIFIED_MSG, 409);
    }

    const pending = await this.otps.findLatestPending(row.id, getOtpMaxFailedAttempts());
    if (!pending) {
      throw httpError(OTP_EXPIRED_RESEND, 400);
    }

    const submittedHash = hashOtp(code);
    if (!otpHashesEqual(submittedHash, pending.otpHash)) {
      await this.otps.incrementFailedAttempts(pending.id);
      throw httpError(GENERIC_OTP_REJECT, 400);
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await this.users.markEmailVerified(row.id, client);
      await client.query(
        `UPDATE registration_otp_codes SET used_at = NOW() WHERE id = $1`,
        [pending.id]
      );
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async resendOtp(email: string, clientIp: string): Promise<ResendOtpResult> {
    const ttlSeconds = getOtpTtlSeconds();
    const configuredChannel = resolveConfiguredDeliveryChannel();
    const safeEnvelope = (): ResendOtpResult => ({
      emailVerificationRequired: true,
      otpTtlSeconds: ttlSeconds,
      otpDeliveryChannel: configuredChannel,
    });

    const emailResult = validateInstitutionalEmail(email);
    if (!emailResult.ok) {
      return safeEnvelope();
    }

    const limit = checkResendRateLimit(emailResult.normalized, clientIp);
    if (!limit.ok) {
      throw httpError(
        `Bạn đã yêu cầu gửi lại mã quá nhiều lần. Thử lại sau ${limit.retryAfterSeconds} giây.`,
        429
      );
    }

    const row = await this.resolveUserByEmail(emailResult.normalized);
    if (!row) {
      console.warn('[Auth] OTP resend skipped: user not found');
      return safeEnvelope();
    }
    if (row.email_verified) {
      return {
        emailVerificationRequired: false,
        otpTtlSeconds: ttlSeconds,
        otpDeliveryChannel: configuredChannel,
        alreadyVerified: true,
      };
    }

    const ttlMinutes = getOtpTtlMinutes();
    const plaintextOtp = generateOtpCode();
    const otpHash = hashOtp(plaintextOtp);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await this.otps.issueOtp(client, row.id, otpHash, expiresAt);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const mailTo = row.username.includes('@') ? row.username : emailResult.normalized;
    const channel = await this.deliverOtp(mailTo, plaintextOtp, ttlMinutes);
    if (channel === 'smtp_failed') {
      throw httpError(OTP_MAIL_FAILED_MSG, 503);
    }
    return {
      emailVerificationRequired: true,
      otpTtlSeconds: ttlSeconds,
      otpDeliveryChannel: channel,
    };
  }

  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const normalized = username.trim().toLowerCase();
    const row = await this.resolveUserByEmail(normalized);
    if (!row || typeof row.password !== 'string' || !row.password) {
      await this.passwords.compare(password, DUMMY_PASSWORD_HASH).catch(() => false);
      throw httpError(INVALID_CREDENTIALS_MSG, 401);
    }

    if (row.locked_until && row.locked_until.getTime() > Date.now()) {
      await this.passwords.compare(password, DUMMY_PASSWORD_HASH).catch(() => false);
      throw httpError(INVALID_CREDENTIALS_MSG, 401);
    }

    const valid = await this.passwords.compare(password, row.password);
    if (!valid) {
      await this.users.recordFailedLogin(row.id, LOCKOUT_AFTER_FAILURES, LOCKOUT_MINUTES);
      throw httpError(INVALID_CREDENTIALS_MSG, 401);
    }

    await this.users.resetFailedLogin(row.id);

    if (!row.email_verified) {
      throw httpError(UNVERIFIED_LOGIN_MSG, 403);
    }

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

  /** Full institutional email first, then legacy local-part usernames (seed admin `nltanh`). */
  private async resolveUserByEmail(email: string): Promise<AuthUserRow | null> {
    const normalized = email.trim().toLowerCase();
    let row = await this.users.findByUsername(normalized);
    if (!row && normalized.includes('@')) {
      const local = normalized.slice(0, normalized.indexOf('@'));
      if (local) row = await this.users.findByUsername(local);
    }
    return row;
  }

  private notifyExistingAccount(to: string): void {
    void this.mail
      .send({
        to,
        subject: duplicateRegisterSubject(),
        html: duplicateRegisterHtml(),
        text: duplicateRegisterText(),
        transactional: true,
        headers: { 'X-UMP-RMS-Notification': 'duplicate-register' },
      })
      .catch((e) => {
        console.error('[Auth] duplicate-register notice failed', e);
      });
  }

  private async deliverOtp(
    to: string,
    otp: string,
    ttlMinutes: number
  ): Promise<OtpDeliveryChannel> {
    const configured = resolveConfiguredDeliveryChannel();
    try {
      await this.mail.send({
        to,
        subject: registrationOtpSubject(),
        html: registrationOtpHtml(otp, ttlMinutes),
        text: registrationOtpText(otp, ttlMinutes),
        transactional: true,
        headers: { 'X-UMP-RMS-Notification': 'registration-otp' },
      });
      return configured;
    } catch (e) {
      console.error('[Auth] OTP email delivery failed');
      if (e instanceof Error) {
        console.error('[Auth] OTP email error:', e.message);
      }
      return configured === 'smtp' ? 'smtp_failed' : configured;
    }
  }
}
