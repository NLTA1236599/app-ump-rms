/**
 * Force-resend ectoin midterm reminders after deliverability template changes.
 * Usage: npx tsx src/scripts/resendEctoinDeliverability.ts
 */
import '../config/env.js';
import { pool } from '../config/database.js';
import { MilestoneSyncService } from '../modules/reminders/milestoneSync.service.js';
import { RecipientResolver } from '../modules/reminders/recipientResolver.js';
import { ReminderLogRepository } from '../modules/reminders/reminderLog.repository.js';
import { ReminderRepository } from '../modules/reminders/reminder.repository.js';
import { SendDueRemindersUseCase } from '../modules/reminders/sendDueReminders.useCase.js';
import { createEmailSender } from '../services/email/createEmailSender.js';

const PROJECT_ID = 'bbd2a5ee-3adc-49f6-9be9-bc715925763c';
const SPECIALIST_ID = 'fc6e27ed-b357-4eca-a913-72685951aad1';
const TEMP_LEADER_EMAIL = 'nltanh@ump.edu.vn';

function todayPlusDaysVn(days: number): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (t: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === t)?.value ?? 0);
  const utc = Date.UTC(get('year'), get('month') - 1, get('day'));
  const shifted = new Date(utc + days * 86_400_000);
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-${String(shifted.getUTCDate()).padStart(2, '0')}`;
}

async function main() {
  const { rows } = await pool.query<{ id: string; data: Record<string, unknown> }>(
    `SELECT id, data FROM research_projects WHERE id = $1`,
    [PROJECT_ID],
  );
  const project = rows[0];
  if (!project) throw new Error('Project not found');

  const due = todayPlusDaysVn(30);
  const testData: Record<string, unknown> = {
    ...project.data,
    reviewReportingDate: due,
    principalEmail: TEMP_LEADER_EMAIL,
    supervisorId: SPECIALIST_ID,
  };

  await pool.query(
    `UPDATE research_projects SET data = $2::jsonb, updated_at = NOW() WHERE id = $1`,
    [project.id, JSON.stringify(testData)],
  );

  try {
    await pool.query(
      `DELETE FROM reminder_logs
       WHERE project_milestone_id IN (
         SELECT id FROM project_milestones WHERE project_id = $1
       )`,
      [project.id],
    );
    await new MilestoneSyncService().syncProject(project.id, testData);

    const result = await new SendDueRemindersUseCase(
      new ReminderRepository(),
      new RecipientResolver(),
      new ReminderLogRepository(),
      createEmailSender(),
    ).execute();

    console.log('result:', result);
    console.log('Check inboxes + Spam for nltanh@ump.edu.vn and lhthinh@ump.edu.vn');
  } finally {
    await pool.query(
      `UPDATE research_projects SET data = $2::jsonb, updated_at = NOW() WHERE id = $1`,
      [project.id, JSON.stringify(project.data)],
    );
    await new MilestoneSyncService().syncProject(project.id, project.data);
  }

  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
