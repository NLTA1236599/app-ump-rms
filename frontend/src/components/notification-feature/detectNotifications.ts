import type { ResearchProject } from '../DataTable/types.js';

import { detectDeadlineNotifications } from './detectDeadlineNotifications.js';
import { detectNoteNotifications } from './detectNoteNotifications.js';
import type { DeadlineNotification } from './types.js';

function compareNotifications(a: DeadlineNotification, b: DeadlineNotification): number {
  if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;

  if (a.source === 'note' && b.source === 'note') {
    return b.createdAt.getTime() - a.createdAt.getTime();
  }

  if (a.source === 'deadline' && b.source === 'deadline') {
    return a.daysRemaining - b.daysRemaining;
  }

  if (a.source === 'note') return -1;
  if (b.source === 'note') return 1;
  return a.daysRemaining - b.daysRemaining;
}

export function detectNotifications(
  projects: ResearchProject[],
  userId?: string,
): DeadlineNotification[] {
  const deadlines = detectDeadlineNotifications(projects).map((item) => ({
    ...item,
    source: 'deadline' as const,
  }));
  const notes = detectNoteNotifications(projects, userId);

  return [...notes, ...deadlines].sort(compareNotifications);
}
