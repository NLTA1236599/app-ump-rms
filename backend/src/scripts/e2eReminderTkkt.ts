/**
 * End-to-end test for TKKT milestone reminder engine.
 *
 * 1) Ensure admin + specialist users
 * 2) Seed a research project with due dates = today + 30 days
 * 3) Sync project_milestones + project_specialists
 * 4) Run SendDueRemindersUseCase (offset 30 → trigger today)
 * 5) Assert reminder_logs SENT for LEADER + SPECIALIST
 * 6) Run again → skipped (idempotent)
 *
 * Usage: npm run test:reminder-e2e --prefix backend
 */
import '../config/env.js';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { MilestoneSyncService } from '../modules/reminders/milestoneSync.service.js';
import { RecipientResolver } from '../modules/reminders/recipientResolver.js';
import { ReminderLogRepository } from '../modules/reminders/reminderLog.repository.js';
import { ReminderRepository } from '../modules/reminders/reminder.repository.js';
import { SendDueRemindersUseCase } from '../modules/reminders/sendDueReminders.useCase.js';
import { ConsoleEmailSender } from '../services/email/consoleEmailSender.js';

const PROJECT_ID = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff';
const SPECIALIST_USERNAME = 'cv.reminder.e2e';

function todayPlusDays(days: number): string {
  const d = new Date();
  // Use Asia/Ho_Chi_Minh calendar day
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const get = (t: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === t)?.value ?? 0);
  const utc = Date.UTC(get('year'), get('month') - 1, get('day'));
  const shifted = new Date(utc + days * 86_400_000);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const day = String(shifted.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function ensureSpecialist(): Promise<{ id: string; email: string }> {
  const email = `${SPECIALIST_USERNAME}@ump.edu.vn`;
  const { rows } = await pool.query<{ id: string }>(
    `SELECT id FROM users WHERE username = $1 OR username = $2`,
    [SPECIALIST_USERNAME, email],
  );
  if (rows[0]) return { id: rows[0].id, email };

  const hash = await bcrypt.hash('ReminderE2E!2026', 12);
  const inserted = await pool.query<{ id: string }>(
    `INSERT INTO users (username, password, role, display_name, email_verified)
     VALUES ($1, $2, 'specialist', 'Chuyên viên E2E Reminder', TRUE)
     RETURNING id`,
    [SPECIALIST_USERNAME, hash],
  );
  return { id: inserted.rows[0].id, email };
}

async function main() {
  console.log('=== TKKT Reminder E2E ===');

  const { rows: admins } = await pool.query<{ id: string; username: string }>(
    `SELECT id, username FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1`,
  );
  const admin = admins[0];
  if (!admin) {
    throw new Error('No admin user. Run: npm run seed --prefix backend');
  }

  const leaderEmail = admin.username.includes('@')
    ? admin.username
    : `${admin.username}@ump.edu.vn`;
  const specialist = await ensureSpecialist();
  const due = todayPlusDays(30);

  const data = {
    id: PROJECT_ID,
    title: 'Đề tài E2E nhắc mail TKKT',
    contractId: 'E2E-REMINDER-TKKT',
    leadAuthor: 'Chủ nhiệm E2E',
    principalEmail: leaderEmail,
    supervisorId: specialist.id,
    department: 'Trung tâm Y sinh học phân tử',
    status: 'Đang thực hiện',
    progressReportDate1: due,
    progressReportDate2: due,
    progressReportDate3: due,
    progressReportDate4: due,
    reviewReportingDate: due,
    acceptanceMeetingDate: due,
    // Extension uses offset 90 — leave unset so this E2E focuses on 30-day milestones
    acceptanceCompletionDate: due,
  };

  await pool.query(
    `INSERT INTO research_projects (id, data, created_by, updated_by)
     VALUES ($1, $2::jsonb, $3, $3)
     ON CONFLICT (id) DO UPDATE SET
       data = EXCLUDED.data,
       updated_by = EXCLUDED.updated_by,
       updated_at = NOW()`,
    [PROJECT_ID, JSON.stringify(data), admin.id],
  );

  // Clean previous logs for this project's milestones
  await pool.query(
    `DELETE FROM reminder_logs
     WHERE project_milestone_id IN (
       SELECT id FROM project_milestones WHERE project_id = $1
     )`,
    [PROJECT_ID],
  );
  await pool.query(`DELETE FROM project_milestones WHERE project_id = $1`, [PROJECT_ID]);
  await pool.query(`DELETE FROM project_specialists WHERE project_id = $1`, [PROJECT_ID]);

  const sync = new MilestoneSyncService();
  const synced = await sync.syncProject(PROJECT_ID, data);
  console.log(`Synced milestones: ${synced}`);
  console.log(`Due date (today+30): ${due}`);
  console.log(`Leader: ${leaderEmail}`);
  console.log(`Specialist: ${specialist.email}`);

  const { rows: milestoneRows } = await pool.query(
    `SELECT mt.code, pm.due_date::text, pm.status
     FROM project_milestones pm
     JOIN reminder_milestone_types mt ON mt.id = pm.milestone_type_id
     WHERE pm.project_id = $1
     ORDER BY mt.code`,
    [PROJECT_ID],
  );
  console.log('project_milestones:', milestoneRows);

  const mailer = new ConsoleEmailSender();
  const useCase = new SendDueRemindersUseCase(
    new ReminderRepository(),
    new RecipientResolver(),
    new ReminderLogRepository(),
    mailer,
  );

  const first = await useCase.execute();
  console.log('First run:', first);

  const { rows: logs } = await pool.query(
    `SELECT rl.recipient_email, rl.recipient_role, rl.status, rl.offset_days, mt.code
     FROM reminder_logs rl
     JOIN project_milestones pm ON pm.id = rl.project_milestone_id
     JOIN reminder_milestone_types mt ON mt.id = pm.milestone_type_id
     WHERE pm.project_id = $1
     ORDER BY mt.code, rl.recipient_role, rl.offset_days`,
    [PROJECT_ID],
  );
  console.log(`reminder_logs count: ${logs.length}`);
  console.table(logs);

  const sent = logs.filter((l) => l.status === 'SENT');
  const hasLeader = sent.some((l) => l.recipient_role === 'LEADER');
  const hasSpecialist = sent.some((l) => l.recipient_role === 'SPECIALIST');
  const offset30 = sent.some((l) => Number(l.offset_days) === 30);

  if (first.sent < 2) {
    throw new Error(`Expected >= 2 sent emails (leader+specialist), got sent=${first.sent}`);
  }
  if (!hasLeader || !hasSpecialist) {
    throw new Error('Expected SENT logs for both LEADER and SPECIALIST');
  }
  if (!offset30) {
    throw new Error('Expected at least one SENT log with offset_days=30');
  }

  const second = await useCase.execute();
  console.log('Second run (idempotent):', second);
  if (second.sent !== 0) {
    throw new Error(`Expected 0 sent on second run, got ${second.sent}`);
  }

  console.log('=== E2E PASSED ===');
  await pool.end();
}

main().catch(async (err) => {
  console.error('=== E2E FAILED ===');
  console.error(err);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
