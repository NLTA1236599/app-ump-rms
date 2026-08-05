/**
 * Test TKKT reminder for ACCEPTANCE_EXTENSION (gia hạn nghiệm thu) — offset 90 days.
 * Uses the Myrtaceae project (has leader email + specialist).
 *
 * Usage: npx tsx src/scripts/testReminderExtension.ts
 */
import '../config/env.js';
import { pool } from '../config/database.js';
import { MilestoneSyncService } from '../modules/reminders/milestoneSync.service.js';
import { RecipientResolver } from '../modules/reminders/recipientResolver.js';
import { ReminderLogRepository } from '../modules/reminders/reminderLog.repository.js';
import { ReminderRepository } from '../modules/reminders/reminder.repository.js';
import { SendDueRemindersUseCase } from '../modules/reminders/sendDueReminders.useCase.js';
import { createEmailSender } from '../services/email/createEmailSender.js';

const PROJECT_ID = '98b03e08-23cb-454b-951c-6293a6035e3e';

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
  console.log('=== Test nhắc mail — Gia hạn nghiệm thu (offset 90) ===');

  const { rows } = await pool.query<{ id: string; data: Record<string, unknown> }>(
    `SELECT id, data FROM research_projects WHERE id = $1`,
    [PROJECT_ID],
  );
  const project = rows[0];
  if (!project) throw new Error(`Project not found: ${PROJECT_ID}`);

  const originalExtension = project.data.extensionDate ?? null;
  const due = todayPlusDaysVn(90);
  const testData = { ...project.data, extensionDate: due };

  console.log('title:', testData.title);
  console.log('leader:', testData.principalEmail, '/', testData.leadAuthor);
  console.log('supervisorId:', testData.supervisorId);
  console.log('original extensionDate:', originalExtension);
  console.log('test extensionDate (today+90):', due);

  await pool.query(
    `UPDATE research_projects SET data = $2::jsonb, updated_at = NOW() WHERE id = $1`,
    [project.id, JSON.stringify(testData)],
  );

  try {
    await pool.query(
      `DELETE FROM reminder_logs
       WHERE project_milestone_id IN (
         SELECT pm.id FROM project_milestones pm
         JOIN reminder_milestone_types mt ON mt.id = pm.milestone_type_id
         WHERE pm.project_id = $1 AND mt.code = 'ACCEPTANCE_EXTENSION'
       )`,
      [project.id],
    );

    const sync = new MilestoneSyncService();
    const synced = await sync.syncProject(project.id, testData);
    console.log('synced milestones:', synced);

    const { rows: milestones } = await pool.query(
      `SELECT mt.code, pm.due_date::text, pm.status
       FROM project_milestones pm
       JOIN reminder_milestone_types mt ON mt.id = pm.milestone_type_id
       WHERE pm.project_id = $1 AND mt.code = 'ACCEPTANCE_EXTENSION'`,
      [project.id],
    );
    console.log('ACCEPTANCE_EXTENSION milestone:', milestones);

    const recipients = await new RecipientResolver().resolve(project.id);
    console.log('recipients:', recipients);

    const useCase = new SendDueRemindersUseCase(
      new ReminderRepository(),
      new RecipientResolver(),
      new ReminderLogRepository(),
      createEmailSender(),
    );

    const first = await useCase.execute();
    console.log('First run:', first);

    const { rows: logs } = await pool.query(
      `SELECT rl.recipient_email, rl.recipient_role, rl.status, rl.offset_days, mt.code, mt.name_vi
       FROM reminder_logs rl
       JOIN project_milestones pm ON pm.id = rl.project_milestone_id
       JOIN reminder_milestone_types mt ON mt.id = pm.milestone_type_id
       WHERE pm.project_id = $1 AND mt.code = 'ACCEPTANCE_EXTENSION'
       ORDER BY rl.recipient_role`,
      [project.id],
    );
    console.log(`reminder_logs (extension): ${logs.length}`);
    console.table(logs);

    const sent = logs.filter((l) => l.status === 'SENT');
    const hasLeader = sent.some((l) => l.recipient_role === 'LEADER');
    const hasSpecialist = sent.some((l) => l.recipient_role === 'SPECIALIST');
    const offset90 = sent.every((l) => Number(l.offset_days) === 90) && sent.length > 0;

    if (first.sent < 2 || !hasLeader || !hasSpecialist) {
      throw new Error(
        `Expected SENT to LEADER + SPECIALIST for extension, got sent=${first.sent}`,
      );
    }
    if (!offset90) {
      throw new Error('Expected all SENT logs to use offset_days=90');
    }

    const second = await useCase.execute();
    console.log('Second run (idempotent):', second);
    if (second.sent !== 0) {
      throw new Error(`Expected 0 sent on second run, got ${second.sent}`);
    }

    console.log('=== TEST PASSED ===');
  } finally {
    const restored = { ...testData };
    if (originalExtension == null) {
      delete restored.extensionDate;
    } else {
      restored.extensionDate = originalExtension;
    }
    await pool.query(
      `UPDATE research_projects SET data = $2::jsonb, updated_at = NOW() WHERE id = $1`,
      [project.id, JSON.stringify(restored)],
    );
    await new MilestoneSyncService().syncProject(
      project.id,
      restored as Record<string, unknown>,
    );
    console.log('Restored original extensionDate:', originalExtension);
  }

  await pool.end();
}

main().catch(async (err) => {
  console.error('=== TEST FAILED ===');
  console.error(err);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
