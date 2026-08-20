/** Client defaults — overridden by server `otpTtlSeconds` when present. */
export const DEFAULT_OTP_TTL_SECONDS = 10 * 60;
export const RESEND_COOLDOWN_SECONDS = 60;
export const OTP_LENGTH = 6;

export type OtpDeliveryChannel = 'smtp' | 'log_only' | 'none' | 'smtp_failed';

export type RegistrationWizardStep = 'form' | 'otp' | 'success';

export function deliveryChannelHelp(channel: OtpDeliveryChannel | string | undefined): string | null {
  switch (channel) {
    case 'log_only':
      return 'Môi trường phát triển: mã OTP được ghi vào log máy chủ (chưa cấu hình SMTP).';
    case 'smtp_failed':
      return 'Gửi email thất bại. Bấm «Gửi lại mã» hoặc kiểm tra cấu hình SMTP với quản trị viên.';
    case 'none':
      return 'Không gửi được email xác minh. Liên hệ quản trị viên.';
    case 'smtp':
      return 'Mã đã gửi qua email. Nếu không thấy, kiểm tra hộp thư rác (Spam). Mã cũ hết hiệu lực khi gửi lại.';
    default:
      return null;
  }
}
