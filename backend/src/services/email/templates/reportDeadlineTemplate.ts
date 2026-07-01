import type { IEmailTemplate, ReminderTemplateData } from '../IEmailTemplate.js';
import { ctaButton, deadlineTable, footer } from './templateHelpers.js';

export class ReportDeadlineTemplate implements IEmailTemplate {
  subject(data: ReminderTemplateData): string {
    return `[RMS] Nhắc nhở: Đề tài "${data.projectTitle}" còn ${data.daysOrMonths} nộp Hồ sơ nghiệm thu`;
  }

  html(data: ReminderTemplateData): string {
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;">
        <h2 style="color:#d97706;">⚠️ Nhắc nhở nộp Hồ sơ nghiệm thu đề tài</h2>
        <p>Kính gửi <strong>${data.recipientName}</strong> (${data.role}),</p>
        <p>
          Đề tài <strong>"${data.projectTitle}"</strong> còn
          <span style="color:red;font-weight:bold;">${data.daysOrMonths}</span>
          để nộp Hồ sơ nghiệm thu đề tài.
        </p>
        ${deadlineTable(data.deadlineDate)}
        <p>Vui lòng hoàn thành và nộp báo cáo trước thời hạn.</p>
        ${ctaButton('#d97706')}
        ${footer()}
      </div>
    `;
  }
}
