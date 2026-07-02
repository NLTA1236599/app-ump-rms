import type { SubmitterProject } from '../../types/submitter.js';
import { DEMO_ANNOUNCEMENTS } from './notificationsData.js';
import type { AnnouncementItem, ColumnId, KanbanTask } from './types.js';

function statusToColumn(status: SubmitterProject['status']): ColumnId {
  switch (status) {
    case 'APPROVED':
      return 'completed';
    case 'PENDING':
      return 'pre_acceptance';
    case 'REJECTED':
      return 'report';
    default:
      return 'review';
  }
}

function statusToProgress(status: SubmitterProject['status']): number {
  switch (status) {
    case 'APPROVED':
      return 100;
    case 'PENDING':
      return 72;
    case 'REJECTED':
      return 35;
    default:
      return 15;
  }
}

export function submitterProjectToKanbanTask(
  project: SubmitterProject,
  ownerLabel: string,
): KanbanTask {
  const endLabel = `${project.durationMonths} tháng`;

  return {
    id: project.id,
    columnId: statusToColumn(project.status),
    title: project.title,
    owner: ownerLabel,
    unit: project.level,
    dueDate: '02/2026',
    startDate: '—',
    endDate: endLabel,
    progressPct: statusToProgress(project.status),
    categories: [project.level.toUpperCase()],
  };
}

export function buildSubmitterAnnouncements(projects: SubmitterProject[]): AnnouncementItem[] {
  const fromProjects: AnnouncementItem[] = projects
    .filter((project) => project.status === 'APPROVED' || project.status === 'PENDING')
    .slice(0, 3)
    .map((project) => ({
      id: `announcement-${project.id}`,
      tag: project.status === 'APPROVED' ? 'SẮP NGHIỆM THU' : 'THÔNG BÁO',
      tone: project.status === 'APPROVED' ? 'pre_acceptance' : 'notice',
      title: `${project.title} — hạn kết thúc ${project.durationMonths} tháng`,
      at: new Date(project.createdAt),
    }));

  if (fromProjects.length > 0) {
    return [...fromProjects, ...DEMO_ANNOUNCEMENTS].slice(0, 5);
  }

  return DEMO_ANNOUNCEMENTS;
}

/** Demo cards so the board matches port 5173 density when the submitter has few projects. */
export const DEMO_KANBAN_TASKS: KanbanTask[] = [
  {
    id: 'demo-review-1',
    columnId: 'review',
    title: 'Nghiên cứu ứng dụng stem cell trong điều trị thoái hóa khớp gối',
    owner: 'TS.BS. Nguyễn Văn A',
    unit: 'KHOA Y',
    dueDate: '03/2026',
    startDate: '—',
    endDate: '36 tháng',
    progressPct: 20,
    categories: ['SINH VIÊN'],
  },
  {
    id: 'demo-report-1',
    columnId: 'report',
    title: 'Đánh giá hiệu quả can thiệp dinh dưỡng ở bệnh nhân suy tim',
    owner: 'PGS.TS. Trần Thị B',
    unit: 'TRUNG TÂM',
    dueDate: '04/2026',
    startDate: '01/2024',
    endDate: '24 tháng',
    progressPct: 55,
    categories: ['LOẠI C'],
  },
  {
    id: 'demo-pre-1',
    columnId: 'pre_acceptance',
    title: 'Ứng dụng AI trong nghiên cứu khoa học và',
    owner: 'Đỗ Quốc Vũ',
    unit: 'CẤP CƠ SỞ',
    dueDate: '02/2026',
    startDate: '—',
    endDate: '24 tháng',
    progressPct: 82,
    categories: ['CẤP CƠ SỞ'],
  },
  {
    id: 'demo-completed-1',
    columnId: 'completed',
    title: 'Phân tích dữ liệu lớm trong dự báo bệnh truyền nhiễm',
    owner: 'SVD21. Lê Thị Kim Chi',
    unit: 'ĐƯỢC',
    dueDate: '01/2026',
    startDate: '01/2023',
    endDate: '24 tháng',
    progressPct: 100,
    categories: ['SINH VIÊN'],
  },
];

export function mergeKanbanTasks(projectTasks: KanbanTask[]): KanbanTask[] {
  const existingIds = new Set(projectTasks.map((task) => task.id));
  const demoTasks = DEMO_KANBAN_TASKS.filter((task) => !existingIds.has(task.id));
  return [...projectTasks, ...demoTasks];
}
