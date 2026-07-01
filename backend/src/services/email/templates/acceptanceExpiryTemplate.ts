import type { IEmailTemplate, ReminderTemplateData } from '../IEmailTemplate.js';
import { ctaButton, deadlineTable, footer } from './templateHelpers.js';

export class AcceptanceExpiryTemplate implements IEmailTemplate {
  subject(data: ReminderTemplateData): string {
    return `[RMS] Nhắc nhở: Đề tài "${data.projectTitle}" còn ${data.daysOrMonths} hết hạn chấp thuận gia hạn`;
  }

  html(data: ReminderTemplateData): string {
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;">
        <h2 style="color:#dc2626;">🔔 Nhắc nhở hết hạn chấp thuận hồ sơ gia hạn</h2>
        <p>Kính gửi <strong>${data.recipientName}</strong> (${data.role}),</p>
        <p>
          Đề tài <strong>"${data.projectTitle}"</strong> sẽ
          <span style="color:red;font-weight:bold;">hết hạn chấp thuận hồ sơ gia hạn trong ${data.daysOrMonths}</span>.
        </p>
        ${deadlineTable(data.deadlineDate)}
        <p>Vui lòng liên hệ P.KHCN để gia hạn hoặc hoàn tất thủ tục cần thiết.</p>
        ${ctaButton('#dc2626')}
        ${footer()}
      </div>
    `;
  }
}
