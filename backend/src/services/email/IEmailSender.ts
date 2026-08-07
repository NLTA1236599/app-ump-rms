export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  /** Plain-text alternative — strongly recommended for deliverability. */
  text?: string;
  /** Optional headers (List-Unsubscribe, etc.). */
  headers?: Record<string, string>;
  replyTo?: string;
};

/** Abstraction — jobs depend on this, never on nodemailer directly. */
export interface IEmailSender {
  send(payload: EmailPayload): Promise<void>;
}
