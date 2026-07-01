import type { EmailPayload, IEmailSender } from './IEmailSender.js';

/** Dev fallback when SMTP is not configured — logs instead of sending. */
export class ConsoleEmailSender implements IEmailSender {
  async send(payload: EmailPayload): Promise<void> {
    console.log('[Email:console]', { to: payload.to, subject: payload.subject });
  }
}
