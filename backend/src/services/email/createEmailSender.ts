import { ConsoleEmailSender } from './consoleEmailSender.js';
import { DisabledEmailSender } from './disabledEmailSender.js';
import type { IEmailSender } from './IEmailSender.js';
import { isSmtpConfigured } from './mailEnv.js';
import { NodemailerSender } from './nodemailerSender.js';
import { assertOtpLoggingSafe } from './otpLoggingGuard.js';

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
  assertOtpLoggingSafe();

  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '[Email] MAIL_* is not configured in production — OTP/reminder mail will fail closed (OTP is never logged).'
      );
      return new DisabledEmailSender();
    }
    console.warn(
      '[Email] MAIL_* not configured — using ConsoleEmailSender. OTP body is not logged unless LOG_OTP_FOR_DEV=true.'
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
