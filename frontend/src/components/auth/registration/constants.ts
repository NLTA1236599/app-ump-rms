/** Client defaults — server no longer returns TTL/channel (T04). */
export const DEFAULT_OTP_TTL_SECONDS = 10 * 60;
export const RESEND_COOLDOWN_SECONDS = 60;
export const OTP_LENGTH = 6;

export type RegistrationWizardStep = 'form' | 'otp' | 'success';

export const OTP_GENERIC_HELP =
  'Mã có hiệu lực 10 phút. Nếu không thấy email, kiểm tra hộp thư rác (Spam). Mã cũ hết hiệu lực khi gửi lại.';
