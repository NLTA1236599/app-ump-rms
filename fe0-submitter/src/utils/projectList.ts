import type { StatusFilterId, SubmitterProject, SubmitterProjectStatus } from '../types/submitter.js';

export const STATUS_TABS: {
  id: StatusFilterId;
  label: string;
  statusValue: SubmitterProjectStatus | null;
}[] = [
  { id: 'all', label: 'Tất cả', statusValue: null },
  { id: 'draft', label: 'Bản thảo', statusValue: 'DRAFT' },
  { id: 'pending', label: 'Chờ phê duyệt', statusValue: 'PENDING' },
  { id: 'approved', label: 'Đã phê duyệt', statusValue: 'APPROVED' },
  { id: 'rejected', label: 'Bị từ chối', statusValue: 'REJECTED' },
];

const STATUS_FILTER_MAP: Record<Exclude<StatusFilterId, 'all'>, SubmitterProjectStatus> = {
  draft: 'DRAFT',
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
};

export function getCountForStatus(
  statusValue: SubmitterProjectStatus | null,
  projects: SubmitterProject[],
): number {
  if (!statusValue) return projects.length;
  return projects.filter((project) => project.status === statusValue).length;
}

export function filterProjects(
  projects: SubmitterProject[],
  activeStatus: StatusFilterId,
  searchTerm: string,
): SubmitterProject[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return projects
    .filter((project) => {
      if (activeStatus === 'all') return true;
      return project.status === STATUS_FILTER_MAP[activeStatus];
    })
    .filter((project) => {
      if (!normalizedSearch) return true;
      return (
        project.title.toLowerCase().includes(normalizedSearch) ||
        project.projectCode?.toLowerCase().includes(normalizedSearch) ||
        project.level.toLowerCase().includes(normalizedSearch)
      );
    });
}

export const TABLE_GRID_COLUMNS = '96px 1fr 112px 112px 144px 96px';

export const STATUS_BADGE_CONFIG: Record<
  SubmitterProjectStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  DRAFT: {
    label: 'Bản thảo',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
  },
  PENDING: {
    label: 'Chờ phê duyệt',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
  },
  APPROVED: {
    label: 'Đã phê duyệt',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
  },
  REJECTED: {
    label: 'Bị từ chối',
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
};

export function formatDurationMonths(months: number): string {
  return `${months} tháng`;
}

export function formatProjectCode(code?: string): string {
  return code?.trim() ? code : '—';
}
