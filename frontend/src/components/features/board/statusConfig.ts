import type { IssueStatus } from '../../../types';

export interface StatusUi {
  label: string;
  headerClass: string;
  dotClass: string;
}

export const BOARD_STATUSES: IssueStatus[] = [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
];

export const STATUS_CONFIG: Record<IssueStatus, StatusUi> = {
  backlog: {
    label: 'Backlog',
    headerClass: 'bg-slate-200 text-slate-700',
    dotClass: 'bg-slate-500',
  },
  todo: {
    label: 'To Do',
    headerClass: 'bg-blue-100 text-blue-900',
    dotClass: 'bg-blue-500',
  },
  in_progress: {
    label: 'In Progress',
    headerClass: 'bg-amber-100 text-amber-900',
    dotClass: 'bg-amber-500',
  },
  in_review: {
    label: 'In Review',
    headerClass: 'bg-purple-100 text-purple-900',
    dotClass: 'bg-purple-500',
  },
  done: {
    label: 'Done',
    headerClass: 'bg-emerald-100 text-emerald-900',
    dotClass: 'bg-emerald-500',
  },
};

export function issueTypeBadge(type: string): string {
  switch (type) {
    case 'story':
      return 'bg-green-100 text-green-800';
    case 'bug':
      return 'bg-red-100 text-red-800';
    case 'epic':
      return 'bg-violet-100 text-violet-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export function priorityBadge(p: string): string {
  switch (p) {
    case 'highest':
    case 'high':
      return 'text-orange-700';
    case 'lowest':
    case 'low':
      return 'text-slate-500';
    default:
      return 'text-slate-700';
  }
}
