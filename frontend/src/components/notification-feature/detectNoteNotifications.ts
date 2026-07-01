import type { ResearchProject } from '../DataTable/types.js';

import type { DeadlineNotification } from './types.js';

/** Unread discussion notes addressed to the current user. */
export function detectNoteNotifications(
  projects: ResearchProject[],
  userId?: string,
): DeadlineNotification[] {
  if (!userId) return [];

  const results: DeadlineNotification[] = [];

  for (const project of projects) {
    for (const notification of project.noteNotifications ?? []) {
      if (notification.forUserId !== userId || notification.read) continue;

      const createdAt = new Date(notification.createdAt);
      if (Number.isNaN(createdAt.getTime())) continue;

      results.push({
        id: `note-${notification.id}`,
        entityType: 'note',
        entityId: project.id,
        title: notification.projectTitle?.trim() || project.title?.trim() || 'Đề tài không tên',
        message: notification.message,
        deadlineDate: createdAt,
        daysRemaining: 30,
        deadlineLabel: 'xử lý ghi chú',
        isRead: false,
        createdAt,
        source: 'note',
        noteNotificationId: notification.id,
      });
    }
  }

  return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
