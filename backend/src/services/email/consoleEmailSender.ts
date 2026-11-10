import type { EmailPayload, IEmailSender } from './IEmailSender.js';
import { isOtpDevLoggingEnabled } from './otpLoggingGuard.js';

/**
 * Dev fallback when SMTP is not configured.
 * OTP body is logged only when NODE_ENV=development AND LOG_OTP_FOR_DEV=true.
 */
export class ConsoleEmailSender implements IEmailSender {
  async send(payload: EmailPayload): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Console email sender is not allowed in production');
    }
    if (isOtpDevLoggingEnabled()) {
      console.log('[Email:console]', {
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
        headers: payload.headers,
      });
      return;
    }
    console.log('[Email:console] skipped logging payload (set LOG_OTP_FOR_DEV=true in development to inspect)');
  }
}
