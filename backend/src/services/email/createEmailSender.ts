import { ConsoleEmailSender } from './consoleEmailSender.js';
import type { IEmailSender } from './IEmailSender.js';
import { isSmtpConfigured } from './mailEnv.js';
import { NodemailerSender } from './nodemailerSender.js';

function maskMailbox(value: string): string {
  const at = value.indexOf('@');
  if (at <= 0) return '(set)';
  const local = value.slice(0, at);
  const domain = value.slice(at);
  const visible = local.slice(0, 2);
  return `${visible}***${domain}`;
}

let smtpReadyLogged = false;

export function createEmailSender(): IEmailSender {
  if (!isSmtpConfigured()) {
    console.warn(
      '[Email] MAIL_* not configured (or still placeholders) — using ConsoleEmailSender. ' +
        'For Docker: set MAIL_USER / MAIL_PASS in repo-root .env then recreate the backend container.'
    );
    return new ConsoleEmailSender();
  }

  if (!smtpReadyLogged) {
    const host = (process.env.MAIL_HOST ?? '').trim();
    const user = (process.env.MAIL_USER ?? '').trim();
    console.log(`[Email] SMTP enabled via ${host} as ${maskMailbox(user)}`);
    smtpReadyLogged = true;
  }
  return new NodemailerSender();
}
