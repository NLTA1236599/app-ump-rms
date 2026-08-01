import nodemailer from 'nodemailer';

import type { EmailPayload, IEmailSender } from './IEmailSender.js';

function mailPass(): string {
  // Gmail App Passwords are often copied with spaces — strip them.
  return (process.env.MAIL_PASS ?? '').replace(/\s+/g, '');
}

export class NodemailerSender implements IEmailSender {
  private readonly transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 587),
    secure: false,
    requireTLS: true,
    auth: {
      user: (process.env.MAIL_USER ?? '').trim(),
      pass: mailPass(),
    },
  });

  async send(payload: EmailPayload): Promise<void> {
    const from =
      (process.env.MAIL_FROM ?? '').trim() || (process.env.MAIL_USER ?? '').trim();
    await this.transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
  }
}
