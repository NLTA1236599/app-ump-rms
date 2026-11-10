import { publicAppBaseUrl } from '../../../config/publicAppUrl.js';

export function duplicateRegisterSubject(): string {
  return 'UMP-RMS: có yêu cầu đăng ký với email của bạn';
}

export function duplicateRegisterText(): string {
  const site = publicAppBaseUrl();
  return [
    'Kính gửi Quý thầy/cô,',
    '',
    'Hệ thống UMP-RMS nhận được một yêu cầu đăng ký tài khoản bằng địa chỉ email này.',
    'Nếu đó là bạn, hãy đăng nhập bằng tài khoản hiện có. Không cần đăng ký lại.',
    `Đăng nhập: ${site}`,
    '',
    'Nếu bạn không thực hiện thao tác này, hãy bỏ qua email. Mật khẩu hiện tại không thay đổi.',
    '',
    'Phòng Khoa học Công nghệ — Đại học Y Dược TP. Hồ Chí Minh',
    'Email tự động, vui lòng không trả lời thư này.',
  ].join('\n');
}

export function duplicateRegisterHtml(): string {
  const site = publicAppBaseUrl();
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;color:#111827;line-height:1.5;">
      <p>Kính gửi Quý thầy/cô,</p>
      <p>Hệ thống UMP-RMS nhận được một yêu cầu đăng ký tài khoản bằng địa chỉ email này.
      Nếu đó là bạn, hãy đăng nhập bằng tài khoản hiện có. Không cần đăng ký lại.</p>
      <p><a href="${site}">${site}</a></p>
      <p>Nếu bạn không thực hiện thao tác này, hãy bỏ qua email. Mật khẩu hiện tại không thay đổi.</p>
      <p style="color:#6b7280;font-size:12px;">Phòng Khoa học Công nghệ — Đại học Y Dược TP. Hồ Chí Minh</p>
    </div>
  `;
}
