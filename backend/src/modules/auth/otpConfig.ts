import { isSmtpConfigured as smtpReady } from '../../services/email/mailEnv.js';

export type OtpDeliveryChannel = 'smtp' | 'log_only' | 'none' | 'smtp_failed';

const DEFAULT_TTL_MINUTES = 10;
const MIN_TTL_MINUTES = 5;
const MAX_TTL_MINUTES = 30;
const DEFAULT_MAX_FAILED = 5;

export function getOtpTtlMinutes(): number {
  const raw = Number(process.env.OTP_TTL_MINUTES ?? DEFAULT_TTL_MINUTES);
  if (!Number.isFinite(raw)) return DEFAULT_TTL_MINUTES;
  return Math.min(MAX_TTL_MINUTES, Math.max(MIN_TTL_MINUTES, Math.floor(raw)));
}

export function getOtpTtlSeconds(): number {
  return getOtpTtlMinutes() * 60;
}

export function getOtpMaxFailedAttempts(): number {
  const raw = Number(process.env.OTP_MAX_FAILED_ATTEMPTS ?? DEFAULT_MAX_FAILED);
  if (!Number.isFinite(raw) || raw < 1) return DEFAULT_MAX_FAILED;
  return Math.floor(raw);
}

export function isSmtpConfigured(): boolean {
  return smtpReady();
}

export function resolveConfiguredDeliveryChannel(): Exclude<OtpDeliveryChannel, 'smtp_failed' | 'none'> {
  return smtpReady() ? 'smtp' : 'log_only';
}
