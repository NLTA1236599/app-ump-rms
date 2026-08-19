import nodemailer from 'nodemailer';

import type { EmailPayload, IEmailSender } from './IEmailSender.js';

function mailPass(): string {
  // Gmail App Passwords are often copied with spaces — strip them.
  return (process.env.MAIL_PASS ?? '').replace(/\s+/g, '');
}

function mailUser(): string {
  return (process.env.MAIL_USER ?? '').trim();
}

const MAIL_FROM_NAME = 'UMP-RMS (Phần mềm QLKHCN P.KHCN)';

function mailFromName(): string {
  const configured = (process.env.MAIL_FROM ?? '').trim();
  if (!configured) return MAIL_FROM_NAME;

  const angled = configured.match(/^(.*)<([^>]+)>\s*$/);
  if (angled) {
    const name = angled[1].trim().replace(/^["']|["']$/g, '');
    return name || MAIL_FROM_NAME;
  }

  if (configured.includes('@')) return MAIL_FROM_NAME;
  return configured;
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
    const user = mailUser();
    // From address must be the authenticated mailbox so Gmail SPF/DKIM stay aligned.
    const from = {
      name: mailFromName(),
      address: user,
    };
    const replyTo = (payload.replyTo ?? process.env.MAIL_REPLY_TO ?? user).trim() || undefined;
    const text = (payload.text ?? '').trim() || stripHtml(payload.html);

    const headers: Record<string, string> = {
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
      ...(payload.headers ?? {}),
    };

    // mailto-only: a homepage URL (especially localhost) plus fake One-Click
    // is a junk-mail signal. Real One-Click needs a dedicated RFC 8058 endpoint.
    if (!headers['List-Unsubscribe'] && user) {
      headers['List-Unsubscribe'] = `<mailto:${user}?subject=unsubscribe>`;
    }

    await this.transporter.sendMail({
      from,
      to: payload.to,
      replyTo,
      envelope: user ? { from: user, to: payload.to } : undefined,
      subject: payload.subject,
      text,
      html: payload.html,
      headers,
    });
  }
}
