export function registrationOtpSubject(): string {
  return 'Mã xác minh tài khoản UMP-RMS';
}

export function registrationOtpText(otp: string, ttlMinutes: number): string {
  return [
    'UMP-RMS (Phần mềm QLKHCN P.KHCN)',
    '',
    `Mã OTP của bạn: ${otp}`,
    '',
    `Mã có hiệu lực trong ${ttlMinutes} phút. Không chia sẻ mã này với người khác.`,
    'Nếu bạn không đăng ký tài khoản, hãy bỏ qua email này.',
  ].join('\n');
}

export function registrationOtpHtml(otp: string, ttlMinutes: number): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
      <h2 style="color:#1d4ed8;margin:0 0 12px">Xác minh email đăng ký</h2>
      <p style="margin:0 0 16px;line-height:1.5">
        Mã OTP của bạn là:
      </p>
      <p style="font-size:28px;letter-spacing:0.12em;font-weight:700;margin:0 0 16px;color:#0f172a;font-family:Consolas,'Courier New',monospace">
        ${otp}
      </p>
      <p style="margin:0;color:#475569;font-size:14px;line-height:1.5">
        Mã có hiệu lực trong <strong>${ttlMinutes} phút</strong>. Không chia sẻ mã này với người khác.
      </p>
    </div>
  `.trim();
}
