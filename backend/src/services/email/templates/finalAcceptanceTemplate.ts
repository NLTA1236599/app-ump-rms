import type { IEmailTemplate, ReminderTemplateData } from '../IEmailTemplate.js';
import { ctaButton, deadlineTable, footer } from './templateHelpers.js';

export class FinalAcceptanceTemplate implements IEmailTemplate {
  subject(data: ReminderTemplateData): string {
    return `[RMS] Nhắc nhở: Đề tài "${data.projectTitle}" còn ${data.daysOrMonths} nộp hoàn thiện hồ sơ nghiệm thu cuối cùng`;
  }

  html(data: ReminderTemplateData): string {
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;">
        <h2 style="color:#7c3aed;">📋 Nhắc nhở hoàn thiện hồ sơ nghiệm thu cuối cùng</h2>
        <p>Kính gửi <strong>${data.recipientName}</strong> (${data.role}),</p>
        <p>
          Đề tài <strong>"${data.projectTitle}"</strong> còn
          <span style="color:red;font-weight:bold;">${data.daysOrMonths}</span>
          để hoàn thiện hồ sơ nghiệm thu cuối cùng.
        </p>
        ${deadlineTable(data.deadlineDate)}
        <p>Vui lòng chuẩn bị đầy đủ hồ sơ và nộp trước thời hạn.</p>
        ${ctaButton('#7c3aed')}
        ${footer()}
      </div>
    `;
  }
}
