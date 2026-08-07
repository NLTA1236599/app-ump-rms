import nodemailer from 'nodemailer';

import type { EmailPayload, IEmailSender } from './IEmailSender.js';

function appBaseUrl(): string {
  return (
    process.env.APP_BASE_URL?.trim() ||
    process.env.FRONTEND_ORIGIN?.split(',')[0]?.trim() ||
    'https://www.ump-khcn.com'
  );
}

function mailPass(): string {
  // Gmail App Passwords are often copied with spaces — strip them.
  return (process.env.MAIL_PASS ?? '').replace(/\s+/g, '');
}

function mailUser(): string {
  return (process.env.MAIL_USER ?? '').trim();
}

function mailFrom(): string {
  const configured = (process.env.MAIL_FROM ?? '').trim();
  if (configured) return configured;
  const user = mailUser();
  return user ? `UMP-RMS <${user}>` : 'UMP-RMS';
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/h\d>/gi, '\n\n')
    .replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export class NodemailerSender implements IEmailSender {
  private readonly transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 587),
    secure: false,
    requireTLS: true,
    auth: {
      user: mailUser(),
      pass: mailPass(),
    },
  });

  async send(payload: EmailPayload): Promise<void> {
    const from = mailFrom();
    const user = mailUser();
    const replyTo = (payload.replyTo ?? process.env.MAIL_REPLY_TO ?? user).trim() || undefined;
    const text = (payload.text ?? '').trim() || stripHtml(payload.html);
    const base = appBaseUrl().replace(/\/$/, '');

    const headers: Record<string, string> = {
      'X-Mailer': 'UMP-RMS',
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
      ...(payload.headers ?? {}),
    };

    // Helps Gmail/Outlook treat the message as a legitimate app notification.
    if (!headers['List-Unsubscribe'] && (base || user)) {
      const parts: string[] = [];
      if (base) parts.push(`<${base}/>`);
      if (user) parts.push(`<mailto:${user}?subject=unsubscribe>`);
      if (parts.length > 0) {
        headers['List-Unsubscribe'] = parts.join(', ');
        headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
      }
    }

    await this.transporter.sendMail({
      from,
      to: payload.to,
      replyTo,
      subject: payload.subject,
      text,
      html: payload.html,
      headers,
    });
  }
}
