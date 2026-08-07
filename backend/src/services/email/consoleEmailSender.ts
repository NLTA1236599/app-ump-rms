import type { EmailPayload, IEmailSender } from './IEmailSender.js';

/** Dev fallback when SMTP is not configured — logs full payload (OTP visible in logs). */
export class ConsoleEmailSender implements IEmailSender {
  async send(payload: EmailPayload): Promise<void> {
    console.log('[Email:console]', {
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      headers: payload.headers,
    });
  }
}
