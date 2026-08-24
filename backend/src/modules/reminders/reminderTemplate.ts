import { publicAppBaseUrl } from '../../config/publicAppUrl.js';
import type { DueReminder, ReminderRecipient } from './reminder.types.js';

function daysRemaining(dueDate: string, offsetDays: number): number {
  return Math.max(0, offsetDays);
}

function formatDueDate(dueDate: string): string {
  const [y, m, d] = dueDate.split('-');
  if (!y || !m || !d) return dueDate;
  return `${d}/${m}/${y}`;
}

export function buildReminderEmail(reminder: DueReminder, recipient: ReminderRecipient) {
  const remaining = daysRemaining(reminder.dueDate, reminder.offsetDays);
  const dueLabel = formatDueDate(reminder.dueDate);
  const roleLabel = recipient.role === 'LEADER' ? 'Chủ nhiệm đề tài' : 'Chuyên viên QL';
  const base = publicAppBaseUrl();
  const link = `${base}/?projectId=${encodeURIComponent(reminder.projectId)}`;
  const whenLabel = remaining === 0 ? 'Đúng hạn hôm nay' : `Trước ${remaining} ngày`;

  // Avoid urgency / promo wording that spam filters score highly.
  const subject = `UMP-RMS: ${reminder.milestoneName} — ${reminder.projectTitle}`;

  const contractLine = reminder.projectCode
    ? `Mã/HĐ: ${reminder.projectCode}`
    : '';

  const text = [
    `Kính gửi ${recipient.fullName} (${roleLabel}),`,
    '',
    'Đây là thông báo tự động từ hệ thống quản lý đề tài UMP-RMS.',
    '',
    `Đề tài: ${reminder.projectTitle}`,
    ...(contractLine ? [contractLine] : []),
    `Nội dung: ${reminder.milestoneName}`,
    `Hạn cuối: ${dueLabel}`,
    `Thời điểm nhắc: ${whenLabel}`,
    '',
    `Xem đề tài trên hệ thống: ${link}`,
    '',
    'Phòng KHCN — Đại học Y Dược TP. Hồ Chí Minh',
    'Email tự động, vui lòng không trả lời thư này.',
  ].join('\n');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;color:#111827;line-height:1.5;">
      <p style="margin:0 0 16px 0;font-size:16px;font-weight:bold;color:#111827;">
        Thông báo mốc thời gian đề tài — UMP-RMS
      </p>
      <p>Kính gửi <strong>${escapeHtml(recipient.fullName)}</strong> (${escapeHtml(roleLabel)}),</p>
      <p>
        Hệ thống UMP-RMS xin thông báo đề tài
        <strong>${escapeHtml(reminder.projectTitle)}</strong>
        ${
          reminder.projectCode
            ? `(mã/HĐ: ${escapeHtml(reminder.projectCode)})`
            : ''
        }
        có mốc thời gian sắp đến hạn.
      </p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;font-size:14px;">
        <tr>
          <td style="padding:8px 12px;border:1px solid #d1d5db;width:40%;">Nội dung</td>
          <td style="padding:8px 12px;border:1px solid #d1d5db;">${escapeHtml(reminder.milestoneName)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #d1d5db;">Hạn cuối</td>
          <td style="padding:8px 12px;border:1px solid #d1d5db;">${escapeHtml(dueLabel)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #d1d5db;">Thời điểm nhắc</td>
          <td style="padding:8px 12px;border:1px solid #d1d5db;">${escapeHtml(whenLabel)}</td>
        </tr>
      </table>
      <p>
        Xem chi tiết đề tài:
        <a href="${escapeHtml(link)}">${escapeHtml(link)}</a>
      </p>
      <p style="margin-top:24px;color:#4b5563;font-size:12px;">
        Phòng Khoa học Công nghệ — Đại học Y Dược TP. Hồ Chí Minh<br/>
        Email tự động từ UMP-RMS (<a href="${escapeHtml(base)}">${escapeHtml(base)}</a>).
        Vui lòng không trả lời email này.
      </p>
    </div>
  `;

  return {
    subject,
    html,
    text,
    headers: {
      'X-UMP-RMS-Notification': 'project-reminder',
      'X-UMP-RMS-Project-Id': reminder.projectId,
    },
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
