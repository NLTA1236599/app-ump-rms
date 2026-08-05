import type { NextFunction, Request, Response } from 'express';

import { MilestoneSyncService } from './milestoneSync.service.js';
import { SendDueRemindersUseCase } from './sendDueReminders.useCase.js';

const useCase = new SendDueRemindersUseCase();
const sync = new MilestoneSyncService();

export async function runReminders(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await useCase.execute();
    res.json({ ok: true, engine: 'tkkt', ...result });
  } catch (e) {
    next(e);
  }
}

export async function syncMilestones(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await sync.syncAll();
    res.json({ ok: true, ...result });
  } catch (e) {
    next(e);
  }
}
