import { Router } from 'express';

import { runReminders, syncMilestones } from './reminder.controller.js';

export const reminderRoutes = Router();

/** Manual trigger for TKKT engine (dev/staging). */
reminderRoutes.post('/run', runReminders);
reminderRoutes.post('/sync', syncMilestones);
