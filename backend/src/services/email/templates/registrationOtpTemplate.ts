import { publicAppBaseUrl } from '../../../config/publicAppUrl.js';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function registrationOtpSubject(): string {
  return 'UMP-RMS: xác minh email đăng ký';
}

export function registrationOtpText(otp: string, ttlMinutes: number): string {
  const site = publicAppBaseUrl();
  return [
    'Kính gửi Quý thầy/cô,',
    '',
    'Hệ thống UMP-RMS nhận được yêu cầu đăng ký tài khoản với địa chỉ email này.',
    'Mã xác minh đăng ký của bạn:',
    '',
    otp,
    '',
    `Mã có hiệu lực trong ${ttlMinutes} phút. Không chia sẻ mã này với người khác.`,
    `Đăng nhập hệ thống: ${site}`,
    '',
    'Nếu bạn không đăng ký tài khoản, hãy bỏ qua email này.',
    '',
    'Phòng Khoa học Công nghệ — Đại học Y Dược TP. Hồ Chí Minh',
    'Email tự động, vui lòng không trả lời thư này.',
  ].join('\n');
}

export function registrationOtpHtml(otp: string, ttlMinutes: number): string {
  const site = publicAppBaseUrl();
  const safeOtp = escapeHtml(otp);
  const safeSite = escapeHtml(site);
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;color:#111827;line-height:1.5;">
      <p style="margin:0 0 16px 0;font-size:16px;font-weight:bold;color:#111827;">
        Xác minh email đăng ký — UMP-RMS
      </p>
      <p>Kính gửi Quý thầy/cô,</p>
      <p>
        Hệ thống quản lý đề tài UMP-RMS nhận được yêu cầu đăng ký tài khoản
        với địa chỉ email này. Vui lòng dùng mã xác minh dưới đây để hoàn tất đăng ký.
      </p>
      <table style="border-collapse:collapse;margin:16px 0;font-size:14px;">
        <tr>
          <td style="padding:12px 16px;border:1px solid #d1d5db;background:#f8fafc;font-family:Consolas,'Courier New',monospace;font-size:28px;letter-spacing:0.12em;font-weight:700;color:#0f172a;">
            ${safeOtp}
          </td>
        </tr>
      </table>
      <p style="color:#4b5563;font-size:14px;">
        Mã có hiệu lực trong <strong>${ttlMinutes} phút</strong>.
        Không chia sẻ mã này với người khác.
      </p>
      <p>
        Truy cập hệ thống:
        <a href="${safeSite}">${safeSite}</a>
      </p>
      <p style="margin-top:24px;color:#4b5563;font-size:12px;">
        Phòng Khoa học Công nghệ — Đại học Y Dược TP. Hồ Chí Minh<br/>
        Email tự động từ UMP-RMS. Vui lòng không trả lời email này.
      </p>
    </div>
  `.trim();
}
