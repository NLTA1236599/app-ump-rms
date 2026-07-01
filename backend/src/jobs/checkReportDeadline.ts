import { REMINDER_LABELS } from '../config/reminderConfig.js';
import type { IEmailSender } from '../services/email/IEmailSender.js';
import { ReportDeadlineTemplate } from '../services/email/templates/reportDeadlineTemplate.js';
import type { IReminderQuery } from '../services/reminder/IReminderQuery.js';
import { sendProjectReminders } from './sendProjectReminders.js';

const template = new ReportDeadlineTemplate();
const JOB_TYPE = 'report_deadline_1m';

export async function checkReportDeadline(query: IReminderQuery, mailer: IEmailSender) {
  console.log(`[Job1] Checking report deadlines (${REMINDER_LABELS.report})...`);
  const projects = await query.getProjectsWithReportDeadlineIn1Month();
  const sent = await sendProjectReminders(JOB_TYPE, projects, template, mailer, REMINDER_LABELS.report);
  console.log(`[Job1] Sent ${sent} email(s).`);
}
