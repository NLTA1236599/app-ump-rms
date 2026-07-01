import { REMINDER_LABELS } from '../config/reminderConfig.js';
import type { IEmailSender } from '../services/email/IEmailSender.js';
import { FinalAcceptanceTemplate } from '../services/email/templates/finalAcceptanceTemplate.js';
import type { IReminderQuery } from '../services/reminder/IReminderQuery.js';
import { sendProjectReminders } from './sendProjectReminders.js';

const template = new FinalAcceptanceTemplate();
const JOB_TYPE = 'final_acceptance_1m';

export async function checkFinalAcceptance(query: IReminderQuery, mailer: IEmailSender) {
  console.log(`[Job3] Checking final acceptance deadline (${REMINDER_LABELS.acceptanceShort})...`);
  const projects = await query.getProjectsWithAcceptanceExpiryIn1Month();
  const sent = await sendProjectReminders(
    JOB_TYPE,
    projects,
    template,
    mailer,
    REMINDER_LABELS.acceptanceShort,
  );
  console.log(`[Job3] Sent ${sent} email(s).`);
}
