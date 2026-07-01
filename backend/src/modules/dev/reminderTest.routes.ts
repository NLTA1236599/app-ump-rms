import { Router } from 'express';

import { checkAcceptanceExpiry } from '../../jobs/checkAcceptanceExpiry.js';
import { checkFinalAcceptance } from '../../jobs/checkFinalAcceptance.js';
import { checkReportDeadline } from '../../jobs/checkReportDeadline.js';
import { runAllReminderChecks } from '../../jobs/reminderJob.js';
import { createEmailSender } from '../../services/email/createEmailSender.js';
import { ReminderQueryService } from '../../services/reminder/reminderQueryService.js';

export const reminderTestRoutes = Router();

const query = new ReminderQueryService();
const mailer = createEmailSender();

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
    await runAllReminderChecks({ query, mailer });
    res.json({ ok: true, job: 'all' });
  } catch (e) {
    next(e);
  }
});
