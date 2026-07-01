import cron from 'node-cron';

import {
  REMINDER_START_HOUR,
  REMINDER_START_MINUTE,
  REMINDER_TIMEZONE,
} from '../config/reminderConfig.js';
import { createEmailSender } from '../services/email/createEmailSender.js';
import type { IEmailSender } from '../services/email/IEmailSender.js';
import type { IReminderQuery } from '../services/reminder/IReminderQuery.js';
import { ReminderQueryService } from '../services/reminder/reminderQueryService.js';
import { checkAcceptanceExpiry } from './checkAcceptanceExpiry.js';
import { checkFinalAcceptance } from './checkFinalAcceptance.js';
import { checkReportDeadline } from './checkReportDeadline.js';

export type ReminderJobDeps = {
  query?: IReminderQuery;
  mailer?: IEmailSender;
};

export async function runAllReminderChecks(deps: ReminderJobDeps = {}) {
  const query = deps.query ?? new ReminderQueryService();
  const mailer = deps.mailer ?? createEmailSender();

  console.log('[ReminderJob] Running reminder checks...');
  await checkReportDeadline(query, mailer);
  await checkAcceptanceExpiry(query, mailer);
  await checkFinalAcceptance(query, mailer);
  console.log('[ReminderJob] All checks complete.');
}

function msUntilStartToday(): number {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: REMINDER_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  const year = get('year');
  const month = get('month');
  const day = get('day');
  const hour = get('hour') % 24;
  const minute = get('minute');

  const nowInTz = hour * 60 + minute;
  const targetInTz = REMINDER_START_HOUR * 60 + REMINDER_START_MINUTE;

  if (nowInTz >= targetInTz) return 0;

  const targetUtc = Date.parse(
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(REMINDER_START_HOUR).padStart(2, '0')}:${String(REMINDER_START_MINUTE).padStart(2, '0')}:00+07:00`,
  );

  return Math.max(0, targetUtc - now.getTime());
}

function formatStartTime(): string {
  const h = String(REMINDER_START_HOUR).padStart(2, '0');
  const m = String(REMINDER_START_MINUTE).padStart(2, '0');
  return `${h}:${m}`;
}

export function registerReminderJobs(deps: ReminderJobDeps = {}) {
  const enabled = process.env.REMINDER_JOBS_ENABLED !== 'false';
  if (!enabled) {
    console.log('[ReminderJob] Disabled via REMINDER_JOBS_ENABLED=false');
    return;
  }

  const delayMs = msUntilStartToday();
  const startLabel = formatStartTime();

  setTimeout(() => {
    void runAllReminderChecks(deps).catch((err) => {
      console.error('[ReminderJob] First run failed:', err);
    });

    cron.schedule('* * * * *', () => {
      void runAllReminderChecks(deps).catch((err) => {
        console.error('[ReminderJob] Failed:', err);
      });
    });

    console.log(
      `[ReminderJob] Active — runs every minute (started at ${startLabel} ${REMINDER_TIMEZONE})`,
    );
  }, delayMs);

  if (delayMs === 0) {
    console.log(
      `[ReminderJob] Start time ${startLabel} ${REMINDER_TIMEZONE} already passed — running immediately`,
    );
  } else {
    const mins = Math.ceil(delayMs / 60_000);
    console.log(
      `[ReminderJob] Scheduled — first run at ${startLabel} ${REMINDER_TIMEZONE} today (in ~${mins} min)`,
    );
  }
}
