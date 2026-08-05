import { APP_BASE_URL } from './reminder.config.js';
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
  const roleLabel = recipient.role === 'LEADER' ? 'Chủ nhiệm đề tài' : 'Chuyên viên phụ trách';
  const link = `${APP_BASE_URL.replace(/\/$/, '')}/de-tai-khcn/du-lieu-de-tai`;

  const remainingText =
    remaining === 0 ? 'đúng hạn hôm nay' : `còn ${remaining} ngày`;

  const subject = `[UMP-RMS] Nhắc: ${reminder.milestoneName} — đề tài "${reminder.projectTitle}" ${remainingText}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;color:#111827;">
      <h2 style="color:#1d4ed8;margin-bottom:12px;">Nhắc mốc thời gian đề tài</h2>
      <p>Kính gửi <strong>${escapeHtml(recipient.fullName)}</strong> (${roleLabel}),</p>
      <p>
        Đề tài <strong>"${escapeHtml(reminder.projectTitle)}"</strong>
        ${reminder.projectCode ? `(mã/HĐ: <strong>${escapeHtml(reminder.projectCode)}</strong>)` : ''}
        sắp đến hạn:
      </p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;">
        <tr style="background:#eff6ff;">
          <td style="padding:8px 12px;border:1px solid #bfdbfe;font-weight:bold;">Nội dung</td>
          <td style="padding:8px 12px;border:1px solid #bfdbfe;">${escapeHtml(reminder.milestoneName)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #bfdbfe;font-weight:bold;">Hạn cuối</td>
          <td style="padding:8px 12px;border:1px solid #bfdbfe;color:#b91c1c;font-weight:bold;">${dueLabel}</td>
        </tr>
        <tr style="background:#eff6ff;">
          <td style="padding:8px 12px;border:1px solid #bfdbfe;font-weight:bold;">Thời điểm nhắc</td>
          <td style="padding:8px 12px;border:1px solid #bfdbfe;">${
            remaining === 0 ? 'Đúng hạn' : `Trước ${remaining} ngày`
          }</td>
        </tr>
      </table>
      <p>
        <a href="${link}"
           style="background:#1d4ed8;color:#fff;padding:10px 18px;border-radius:6px;
                  text-decoration:none;display:inline-block;">
          Vào hệ thống
        </a>
      </p>
      <p style="margin-top:24px;color:#6b7280;font-size:12px;">
        Email tự động từ UMP-RMS. Vui lòng không trả lời email này.
      </p>
    </div>
  `;

  return { subject, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
