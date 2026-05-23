import { ProjectStatus } from './types.js';

const BADGE_BASE =
  'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide';

const STATUS_STYLES: Record<string, { className: string; label: string }> = {
  [ProjectStatus.COMPLETED]: { className: 'bg-emerald-100 text-emerald-700', label: 'Hoàn thành' },
  [ProjectStatus.OVERDUE]: { className: 'bg-red-100 text-red-700', label: 'Trễ hạn' },
  [ProjectStatus.ONGOING]: { className: 'bg-blue-100 text-blue-700', label: 'Đang TH' },
  [ProjectStatus.PAUSED]: { className: 'bg-amber-100 text-amber-700', label: 'Tạm dừng' },
  [ProjectStatus.LIQUIDATED]: { className: 'bg-slate-100 text-slate-600', label: 'Thanh lý' },
};

export function getStatusBadge(status: ProjectStatus | string) {
  const config = STATUS_STYLES[status] ?? {
    className: 'bg-slate-100 text-slate-600',
    label: status,
  };

  return (
    <span className={`${BADGE_BASE} ${config.className}`}>{config.label}</span>
  );
}

const PROGRESS_STYLES: Record<string, string> = {
  'Đúng hạn': 'bg-emerald-50 text-emerald-700',
  'Trễ hạn': 'bg-red-50 text-red-700',
  'Gia hạn': 'bg-amber-50 text-amber-700',
};

export function getProgressBadge(status?: string) {
  if (!status) return null;

  const className = PROGRESS_STYLES[status] ?? 'bg-slate-50 text-slate-600';

  return <span className={`${BADGE_BASE} ${className}`}>{status}</span>;
}
