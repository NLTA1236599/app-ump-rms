import { REMINDER_LABELS } from '../config/reminderConfig.js';
import type { IEmailSender } from '../services/email/IEmailSender.js';
import { AcceptanceExpiryTemplate } from '../services/email/templates/acceptanceExpiryTemplate.js';
import type { IReminderQuery } from '../services/reminder/IReminderQuery.js';
import { sendProjectReminders } from './sendProjectReminders.js';

const template = new AcceptanceExpiryTemplate();
const JOB_TYPE = 'acceptance_expiry_3m';

export async function checkAcceptanceExpiry(query: IReminderQuery, mailer: IEmailSender) {
  console.log(`[Job2] Checking acceptance expiry (${REMINDER_LABELS.acceptanceLong})...`);
  const projects = await query.getProjectsWithAcceptanceExpiryIn3Months();
  const sent = await sendProjectReminders(
    JOB_TYPE,
    projects,
    template,
    mailer,
    REMINDER_LABELS.acceptanceLong,
  );
  console.log(`[Job2] Sent ${sent} email(s).`);
}
