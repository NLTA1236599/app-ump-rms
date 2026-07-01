import { useCallback, useMemo, useState } from 'react';

import type { ResearchProject } from '../DataTable/types.js';
import { researchProjectService } from '../../services/index.js';
import {
  markNoteNotificationsRead,
  markSingleNoteNotificationRead,
} from '../viewbutton/projectDiscussion.js';

import { detectNotifications } from './detectNotifications.js';
import type { DeadlineNotification } from './types.js';

const READ_IDS_STORAGE_KEY = 'ump_rms_read_notification_ids';

function loadReadIds(): Set<string> {
  try {
    const stored = localStorage.getItem(READ_IDS_STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function persistReadIds(ids: Set<string>): void {
  localStorage.setItem(READ_IDS_STORAGE_KEY, JSON.stringify([...ids]));
}

export type UseDeadlineNotificationsResult = {
  notifications: DeadlineNotification[];
  unreadCount: number;
  markAllRead: () => Promise<void>;
  markOneRead: (id: string) => Promise<void>;
};

type UseDeadlineNotificationsOptions = {
  projects: ResearchProject[];
  userId?: string;
  refetch?: () => Promise<void>;
};

export function useDeadlineNotifications({
  projects,
  userId,
  refetch,
}: UseDeadlineNotificationsOptions): UseDeadlineNotificationsResult {
  const [readIds, setReadIds] = useState<Set<string>>(loadReadIds);

  const rawNotifications = useMemo(
    () => detectNotifications(projects, userId),
    [projects, userId],
  );

  const notifications = useMemo(
    () =>
      rawNotifications.map((n) => ({
        ...n,
        isRead: n.source === 'note' ? n.isRead : readIds.has(n.id),
      })),
    [rawNotifications, readIds],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const persistNoteRead = useCallback(
    async (mutate: (project: ResearchProject) => ResearchProject) => {
      const targets = projects.filter((project) =>
        (project.noteNotifications ?? []).some((n) => n.forUserId === userId && !n.read),
      );

      await Promise.all(
        targets.map(async (project) => {
          const updated = mutate(project);
          if (updated !== project) {
            await researchProjectService.upsert(updated);
          }
        }),
      );

      await refetch?.();
    },
    [projects, refetch, userId],
  );

  const markAllRead = useCallback(async () => {
    const deadlineIds = notifications.filter((n) => n.source === 'deadline').map((n) => n.id);
    const allIds = new Set([...readIds, ...deadlineIds]);
    setReadIds(allIds);
    persistReadIds(allIds);

    if (userId) {
      await persistNoteRead((project) => markNoteNotificationsRead(project, userId));
    }
  }, [notifications, readIds, userId, persistNoteRead]);

  const markOneRead = useCallback(
    async (id: string) => {
      const item = notifications.find((n) => n.id === id);
      if (!item) return;

      if (item.source === 'note' && item.noteNotificationId && userId) {
        const project = projects.find((p) => p.id === item.entityId);
        if (project) {
          const updated = markSingleNoteNotificationRead(
            project,
            item.noteNotificationId,
            userId,
          );
          await researchProjectService.upsert(updated);
          await refetch?.();
        }
        return;
      }

      const updated = new Set(readIds).add(id);
      setReadIds(updated);
      persistReadIds(updated);
    },
    [notifications, projects, readIds, refetch, userId],
  );

  return { notifications, unreadCount, markAllRead, markOneRead };
}
