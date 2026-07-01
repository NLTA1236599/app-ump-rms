import { ConsoleEmailSender } from './consoleEmailSender.js';
import type { IEmailSender } from './IEmailSender.js';
import { NodemailerSender } from './nodemailerSender.js';

export function createEmailSender(): IEmailSender {
  const hasSmtp =
    Boolean(process.env.MAIL_HOST) &&
    Boolean(process.env.MAIL_USER) &&
    Boolean(process.env.MAIL_PASS);

  if (!hasSmtp) {
    console.warn('[Email] MAIL_* not configured — using ConsoleEmailSender');
    return new ConsoleEmailSender();
  }

  return new NodemailerSender();
}
