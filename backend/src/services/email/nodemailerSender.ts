import nodemailer from 'nodemailer';

import type { EmailPayload, IEmailSender } from './IEmailSender.js';

export class NodemailerSender implements IEmailSender {
  private readonly transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async send(payload: EmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
  }
}
