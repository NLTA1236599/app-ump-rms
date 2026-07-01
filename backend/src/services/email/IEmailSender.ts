export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

/** Abstraction — jobs depend on this, never on nodemailer directly. */
export interface IEmailSender {
  send(payload: EmailPayload): Promise<void>;
}
