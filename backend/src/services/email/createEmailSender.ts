import { ConsoleEmailSender } from './consoleEmailSender.js';
import type { IEmailSender } from './IEmailSender.js';
import { isSmtpConfigured } from './mailEnv.js';
import { NodemailerSender } from './nodemailerSender.js';

export function createEmailSender(): IEmailSender {
  if (!isSmtpConfigured()) {
    console.warn(
      '[Email] MAIL_* not configured (or still placeholders) — using ConsoleEmailSender. ' +
        'For Docker: set MAIL_USER / MAIL_PASS in repo-root .env then recreate the backend container.'
    );
    return new ConsoleEmailSender();
  }

  return new NodemailerSender();
}
