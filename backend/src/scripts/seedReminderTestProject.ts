import '../config/env.js';
import { pool } from '../config/database.js';

/**
 * Seeds one test project for email reminder on 20/06/2026 (UTC+7).
 * Deadlines are offset so jobs fire when the scheduler runs at 11:45:
 * - Job 1 (+1 min): reviewReportingDate → 11:46
 * - Job 2 (+3 min): extensionDate       → 11:48
 * - Job 3 (+1 min): extensionDate       → 11:46 (same field as Job 2 window)
 */
async function main() {
  const useNow = process.env.REMINDER_TEST_USE_NOW === 'true';
  const testDate = process.env.REMINDER_TEST_DATE ?? '2026-06-20';
  const runHour = Number(process.env.REMINDER_START_HOUR ?? 11);
  const runMinute = Number(process.env.REMINDER_START_MINUTE ?? 45);

  const pad = (n: number) => String(n).padStart(2, '0');
  let reportDeadline: string;
  let extensionLong: string;
  let extensionShort: string;
  let scheduleLabel: string;

  if (useNow) {
    const now = new Date();
    reportDeadline = offsetFromDate(now, 1);
    extensionLong = offsetFromDate(now, 3);
    extensionShort = offsetFromDate(now, 1);
    scheduleLabel = 'now (dynamic)';
  } else {
    const base = `${testDate}T${pad(runHour)}:${pad(runMinute)}:00+07:00`;
    reportDeadline = offsetMinutes(base, 1);
    extensionLong = offsetMinutes(base, 3);
    extensionShort = offsetMinutes(base, 1);
    scheduleLabel = `${pad(runHour)}:${pad(runMinute)} Asia/Ho_Chi_Minh`;
  }

  const { rows: admins } = await pool.query<{ id: string; username: string }>(
    `SELECT id, username FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1`,
  );

  const admin = admins[0];
  if (!admin) {
    console.error('No admin user found. Run npm run seed --prefix backend first.');
    process.exit(1);
  }

  const leaderEmail = admin.username.includes('@')
    ? admin.username
    : `${admin.username}@ump.edu.vn`;

  const projectId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  const data = {
    id: projectId,
    title: 'Đề tài test nhắc email 20/06/2026',
    contractId: 'TEST-REMINDER-001',
    leadAuthor: 'Quản trị viên test',
    principalEmail: leaderEmail,
    department: 'Y',
    researchField: 'Y học cơ sở',
    budget: 1_000_000,
    status: 'Đang thực hiện',
    reviewReportingDate: reportDeadline,
    extensionDate: extensionLong,
    acceptanceCompletionDate: extensionShort,
  };

  await pool.query(
    `INSERT INTO research_projects (id, data, created_by, updated_by)
     VALUES ($1, $2::jsonb, $3, $3)
     ON CONFLICT (id) DO UPDATE SET
       data = EXCLUDED.data,
       updated_by = EXCLUDED.updated_by,
       updated_at = NOW()`,
    [projectId, JSON.stringify(data), admin.id],
  );

  await pool.query(`DELETE FROM reminder_send_log WHERE project_id = $1`, [projectId]);

  console.log('Reminder test project ready:');
  console.log(`  id:                  ${projectId}`);
  console.log(`  leader email:        ${leaderEmail}`);
  console.log(`  reviewReportingDate: ${reportDeadline} (Job 1, +1 min)`);
  console.log(`  extensionDate:       ${extensionLong} (Job 2, +3 min)`);
  console.log(`  Scheduler start:     ${scheduleLabel}`);

  await pool.end();
}

function offsetMinutes(isoBase: string, minutes: number): string {
  const d = new Date(isoBase);
  d.setMinutes(d.getMinutes() + minutes);
  return formatHanoiIso(d);
}

function offsetFromDate(base: Date, minutes: number): string {
  const d = new Date(base.getTime());
  d.setMinutes(d.getMinutes() + minutes);
  return formatHanoiIso(d);
}

function formatHanoiIso(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '00';

  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}+07:00`;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
