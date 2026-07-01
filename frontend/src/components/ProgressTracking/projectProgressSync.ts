import { formatDate } from '../DataTable/formatDate.js';
import type { ResearchProject } from '../DataTable/types.js';

import type { AnnouncementItem, ColumnId, KanbanTask } from './types.js';

function parseProjectDate(value: string | number | null | undefined): Date | null {
  const formatted = formatDate(value);
  if (!formatted) return null;

  const match = formatted.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function monthsUntil(date: Date): number {
  const now = new Date();
  return (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
}

export function getProjectKanbanColumn(project: ResearchProject): ColumnId {
  const status = String(project.status ?? '').toLowerCase();

  if (status.includes('nghiệm thu') || status.includes('hoàn thành') || status.includes('thanh lý')) {
    return 'completed';
  }

  const endDate = parseProjectDate(project.endDate);
  if (endDate) {
    const monthsLeft = monthsUntil(endDate);
    if (monthsLeft < 0 || status.includes('trễ hạn')) return 'report';
    if (monthsLeft <= 3) return 'pre_acceptance';
  } else if (status.includes('trễ hạn')) {
    return 'report';
  }

  if (
    project.progressReportDate1 ||
    project.progressReportDate2 ||
    project.progressReportDate3 ||
    project.progressReportDate4 ||
    project.reviewReportingDate ||
    String(project.progressStatus ?? '').toLowerCase().includes('tiến độ')
  ) {
    return 'report';
  }

  return 'review';
}

export function projectToKanbanTask(project: ResearchProject): KanbanTask {
  const categories = Array.isArray(project.categories)
    ? project.categories
    : project.categories
      ? [String(project.categories)]
      : undefined;

  return {
    id: project.id,
    columnId: getProjectKanbanColumn(project),
    title: project.title,
    owner: project.leadAuthor,
    unit: project.department,
    dueDate: formatDate(project.endDate) || '—',
    note: project.progressReportNote,
    categories,
  };
}

export function buildProjectAnnouncements(
  projects: ResearchProject[],
  currentUserId?: string,
): AnnouncementItem[] {
  if (projects.length === 0) return [];

  const announcements: AnnouncementItem[] = [];
  const now = new Date();

  if (currentUserId) {
    for (const project of projects) {
      for (const notification of project.noteNotifications ?? []) {
        if (notification.forUserId !== currentUserId || notification.read) continue;
        announcements.push({
          id: notification.id,
          tag: 'TRAO ĐỔI',
          tone: 'notice',
          title: notification.message,
          at: new Date(notification.createdAt),
        });
      }
    }
  }

  for (const project of projects) {
    const status = String(project.status ?? '').toLowerCase();
    const endDate = parseProjectDate(project.endDate);
    const title = project.title || project.contractId || 'Đề tài';

    if (status.includes('trễ hạn') || (endDate && endDate < now && !status.includes('nghiệm thu'))) {
      announcements.push({
        id: `overdue-${project.id}`,
        tag: 'TRỄ HẠN',
        tone: 'overdue',
        title: `${title} — cần báo cáo tiến độ`,
        at: endDate ?? now,
      });
      continue;
    }

    if (endDate && monthsUntil(endDate) <= 3 && monthsUntil(endDate) >= 0) {
      announcements.push({
        id: `pre-acceptance-${project.id}`,
        tag: 'SẮP NGHIỆM THU',
        tone: 'pre_acceptance',
        title: `${title} — hạn kết thúc ${formatDate(project.endDate)}`,
        at: endDate,
      });
    }
  }

  if (announcements.length === 0) {
    announcements.push({
      id: 'sync-summary',
      tag: 'THÔNG BÁO',
      tone: 'notice',
      title: `Đang theo dõi tiến độ ${projects.length} đề tài từ dữ liệu nghiên cứu`,
      at: now,
    });
  }

  announcements.sort((a, b) => b.at.getTime() - a.at.getTime());
  return announcements.slice(0, 5);
}
