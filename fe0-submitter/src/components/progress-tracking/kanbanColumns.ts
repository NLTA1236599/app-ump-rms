import type { ColumnConfig } from './types.js';

export const KANBAN_COLUMNS: ColumnConfig[] = [
  {
    id: 'review',
    label: 'XÉT DUYỆT ĐỀ CƯƠNG',
    theme: {
      bg: 'bg-blue-50/50',
      border: 'border-blue-200',
      title: 'text-blue-600',
      badgeBorder: 'border-blue-100',
      dashedBtn: 'border-blue-200 text-blue-400',
      hoverBtn: 'hover:bg-blue-50',
      modalHeader: 'bg-blue-600',
    },
  },
  {
    id: 'report',
    label: 'BÁO CÁO TIẾN ĐỘ & GIÁM ĐỊNH',
    theme: {
      bg: 'bg-amber-50/50',
      border: 'border-amber-200',
      title: 'text-amber-600',
      badgeBorder: 'border-amber-100',
      dashedBtn: 'border-amber-200 text-amber-400',
      hoverBtn: 'hover:bg-amber-50',
      modalHeader: 'bg-amber-500',
    },
  },
  {
    id: 'pre_acceptance',
    label: 'SẮP NGHIỆM THU',
    theme: {
      bg: 'bg-purple-50/50',
      border: 'border-purple-200',
      title: 'text-purple-600',
      badgeBorder: 'border-purple-100',
      dashedBtn: 'border-purple-200 text-purple-400',
      hoverBtn: 'hover:bg-purple-50',
      modalHeader: 'bg-purple-600',
    },
  },
  {
    id: 'completed',
    label: 'HOÀN THÀNH',
    theme: {
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-200',
      title: 'text-emerald-600',
      badgeBorder: 'border-emerald-100',
      dashedBtn: 'border-emerald-200 text-emerald-400',
      hoverBtn: 'hover:bg-emerald-50',
      modalHeader: 'bg-emerald-600',
    },
  },
];
