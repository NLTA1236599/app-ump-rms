/**
 * Test TKKT reminders against the real Myrtaceae project.
 * Temporarily sets midterm due = today+30 (VN), runs engine, restores original date.
 *
 * Usage: npx tsx src/scripts/testReminderMyrtaceae.ts
 */
import '../config/env.js';
import { pool } from '../config/database.js';
import { MilestoneSyncService } from '../modules/reminders/milestoneSync.service.js';
import { RecipientResolver } from '../modules/reminders/recipientResolver.js';
import { ReminderLogRepository } from '../modules/reminders/reminderLog.repository.js';
import { ReminderRepository } from '../modules/reminders/reminder.repository.js';
import { SendDueRemindersUseCase } from '../modules/reminders/sendDueReminders.useCase.js';
import { createEmailSender } from '../services/email/createEmailSender.js';

const TITLE =
  'Nghiên cứu đặc điểm thực vật, mã vạch DNA và sơ bộ thành phần hóa học của một số loài trong họ Sim (Myrtaceae)';

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
  console.log('=== Test nhắc mail — đề tài Myrtaceae ===');

  const { rows } = await pool.query<{
    id: string;
    data: Record<string, unknown>;
  }>(
    `SELECT id, data
     FROM research_projects
     WHERE data->>'title' = $1
       AND COALESCE(data->>'principalEmail', '') <> ''
     ORDER BY updated_at DESC
     LIMIT 1`,
    [TITLE],
  );

  const project = rows[0];
  if (!project) {
    throw new Error(`Không tìm thấy đề tài có email chủ nhiệm: ${TITLE}`);
  }

  const originalMidterm = project.data.reviewReportingDate ?? null;
  const due = todayPlusDaysVn(30);
  const testData = {
    ...project.data,
    reviewReportingDate: due,
  };

  console.log('project_id:', project.id);
  console.log('leader:', testData.principalEmail, '/', testData.leadAuthor);
  console.log('supervisorId:', testData.supervisorId);
  console.log('original midterm:', originalMidterm);
  console.log('test midterm (today+30):', due);

  await pool.query(
    `UPDATE research_projects
     SET data = $2::jsonb, updated_at = NOW()
     WHERE id = $1`,
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

    const sync = new MilestoneSyncService();
    const synced = await sync.syncProject(project.id, testData);
    console.log('synced milestones:', synced);

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
       WHERE pm.project_id = $1
       ORDER BY rl.recipient_role, rl.recipient_email`,
      [project.id],
    );
    console.log(`reminder_logs for this project: ${logs.length}`);
    console.table(logs);

    const sent = logs.filter((l) => l.status === 'SENT');
    const hasLeader = sent.some((l) => l.recipient_role === 'LEADER');
    const hasSpecialist = sent.some((l) => l.recipient_role === 'SPECIALIST');

    if (first.sent < 2 || !hasLeader || !hasSpecialist) {
      throw new Error(
        `Expected SENT to LEADER + SPECIALIST, got sent=${first.sent}, logs=${JSON.stringify(sent)}`,
      );
    }

    const second = await useCase.execute();
    console.log('Second run (idempotent):', second);
    if (second.sent !== 0) {
      throw new Error(`Expected 0 sent on second run, got ${second.sent}`);
    }

    console.log('=== TEST PASSED ===');
  } finally {
    const restored = {
      ...testData,
      reviewReportingDate: originalMidterm,
    };
    if (originalMidterm == null) {
      delete restored.reviewReportingDate;
    }
    await pool.query(
      `UPDATE research_projects
       SET data = $2::jsonb, updated_at = NOW()
       WHERE id = $1`,
      [project.id, JSON.stringify(restored)],
    );
    const sync = new MilestoneSyncService();
    await sync.syncProject(project.id, restored as Record<string, unknown>);
    console.log('Restored original reviewReportingDate:', originalMidterm);
  }

  await pool.end();
}

main().catch(async (err) => {
  console.error('=== TEST FAILED ===');
  console.error(err);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
