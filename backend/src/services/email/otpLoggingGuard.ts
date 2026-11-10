/** T05: OTP must never be logged in production. */

export function isOtpDevLoggingEnabled(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.LOG_OTP_FOR_DEV === 'true';
}

export function assertOtpLoggingSafe(): void {
  if (process.env.NODE_ENV === 'production' && process.env.LOG_OTP_FOR_DEV === 'true') {
    throw new Error('LOG_OTP_FOR_DEV must not be enabled when NODE_ENV=production');
  }
}
