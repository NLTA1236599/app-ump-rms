import type { EmailPayload, IEmailSender } from './IEmailSender.js';

/** Production fallback when SMTP is missing — fails closed, never logs the body (OTP). */
export class DisabledEmailSender implements IEmailSender {
  async send(_payload: EmailPayload): Promise<void> {
    throw new Error('SMTP is not configured');
  }
}
