import { Router } from 'express';

import { checkAcceptanceExpiry } from '../../jobs/checkAcceptanceExpiry.js';
import { checkFinalAcceptance } from '../../jobs/checkFinalAcceptance.js';
import { checkReportDeadline } from '../../jobs/checkReportDeadline.js';
import { runAllReminderChecks, runTkktReminderEngine } from '../../jobs/reminderJob.js';
import { syncMilestones } from '../reminders/reminder.controller.js';
import { createEmailSender } from '../../services/email/createEmailSender.js';
import { ReminderQueryService } from '../../services/reminder/reminderQueryService.js';

export const reminderTestRoutes = Router();

const query = new ReminderQueryService();
const mailer = createEmailSender();

/** TKKT configurable engine (preferred). */
reminderTestRoutes.post('/run', async (_req, res, next) => {
  try {
    const result = await runTkktReminderEngine(mailer);
    res.json({ ok: true, engine: 'tkkt', ...result });
  } catch (e) {
    next(e);
  }
});

reminderTestRoutes.post('/sync', syncMilestones);

reminderTestRoutes.post('/report', async (_req, res, next) => {
  try {
    await checkReportDeadline(query, mailer);
    res.json({ ok: true, job: 'report' });
  } catch (e) {
    next(e);
  }
});

reminderTestRoutes.post('/expiry', async (_req, res, next) => {
  try {
    await checkAcceptanceExpiry(query, mailer);
    res.json({ ok: true, job: 'expiry' });
  } catch (e) {
    next(e);
  }
});

reminderTestRoutes.post('/final', async (_req, res, next) => {
  try {
    await checkFinalAcceptance(query, mailer);
    res.json({ ok: true, job: 'final' });
  } catch (e) {
    next(e);
  }
});

reminderTestRoutes.post('/all', async (_req, res, next) => {
  try {
    const result = await runAllReminderChecks({ query, mailer });
    res.json({ ok: true, job: 'all', ...result });
  } catch (e) {
    next(e);
  }
});
