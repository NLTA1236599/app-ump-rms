export function registrationOtpSubject(): string {
  return '[RMS] Mã xác minh đăng ký tài khoản';
}

export function registrationOtpHtml(otp: string, ttlMinutes: number): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
      <h2 style="color:#1d4ed8;margin:0 0 12px">Xác minh email đăng ký</h2>
      <p style="margin:0 0 16px;line-height:1.5">
        Mã OTP của bạn là:
      </p>
      <p style="font-size:28px;letter-spacing:0.35em;font-weight:700;margin:0 0 16px;color:#0f172a">
        ${otp}
      </p>
      <p style="margin:0;color:#475569;font-size:14px;line-height:1.5">
        Mã có hiệu lực trong <strong>${ttlMinutes} phút</strong>. Không chia sẻ mã này với người khác.
      </p>
    </div>
  `.trim();
}
