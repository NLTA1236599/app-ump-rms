import { useMemo, useState } from 'react';

import {
  estimateProjectProgress,
  formatBudgetShort,
  getStatusColor,
} from './projectAnalytics.js';
import type { ResearchProject } from './types.js';

const PAGE_SIZE = 10;

export type PerformanceBreakdownTableProps = {
  projects: ResearchProject[];
  onViewProject?: (projectId: string) => void;
  onViewMore?: () => void;
};

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('trễ hạn') || s.includes('quá hạn')) {
    return 'border-red-200 bg-red-100 text-red-700';
  }
  if (s.includes('gia hạn')) return 'border-amber-200 bg-amber-100 text-amber-700';
  if (s.includes('nghiệm thu') || s.includes('hoàn thành') || s.includes('đúng hạn')) {
    return 'border-emerald-200 bg-emerald-100 text-emerald-700';
  }
  if (s.includes('thanh lý')) return 'border-slate-200 bg-slate-100 text-slate-600';
  return 'border-blue-200 bg-blue-100 text-blue-700';
}

function progressBarColor(progress: number): string {
  if (progress >= 80) return '#10b981';
  if (progress >= 50) return '#1a6ec2';
  if (progress >= 20) return '#f59e0b';
  return '#ef4444';
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function PerformanceBreakdownTable({
  projects,
  onViewProject,
  onViewMore,
}: PerformanceBreakdownTableProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const rows = useMemo(
    () =>
      projects.map((p) => ({
        project: p,
        progress: estimateProjectProgress(p),
        typeLabel: p.categories?.split(',')[0]?.trim() || '—',
      })),
    [projects],
  );

  const visible = rows.slice(0, visibleCount);
  const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
  const avgProgress =
    rows.length > 0
      ? Math.round(rows.reduce((sum, r) => sum + r.progress, 0) / rows.length)
      : 0;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-2 py-1.5">
        <h3 className="text-[11px] font-bold text-[#1a6ec2]">Bảng Phân Tích Hiệu Suất Đề Tài</h3>
        <p className="text-[9px] text-slate-400">Phân tích theo Kinh phí, Tiến độ và Hiệu suất</p>
      </div>

      <div className="max-h-[220px] overflow-auto">
        <table className="min-w-full text-left text-[11px]">
          <thead className="sticky top-0 bg-[#1a6ec2] text-[9px] font-black uppercase tracking-wider text-white">
            <tr>
              <th className="px-2 py-1.5">Tên đề tài</th>
              <th className="px-2 py-1.5">Chủ nhiệm</th>
              <th className="px-2 py-1.5">Kinh phí</th>
              <th className="px-2 py-1.5">Tiến độ</th>
              <th className="px-2 py-1.5">Đơn vị</th>
              <th className="px-2 py-1.5">Trạng thái</th>
              <th className="px-2 py-1.5">Loại</th>
              <th className="px-2 py-1.5">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(({ project: p, progress, typeLabel }) => {
              const isOutlier =
                String(p.status).toLowerCase().includes('trễ hạn') || progress < 10;
              return (
                <tr
                  key={p.id}
                  className={`border-b border-slate-100 transition-colors ${
                    isOutlier ? 'bg-amber-50 hover:bg-amber-100' : 'bg-white hover:bg-blue-50/30'
                  }`}
                >
                  <td className="max-w-[160px] truncate px-2 py-1 text-[11px] font-medium text-slate-700">
                    {p.title?.trim() || '—'}
                  </td>
                  <td className="px-2 py-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                                   text-[9px] font-bold text-white"
                        style={{ backgroundColor: getStatusColor(String(p.status)) }}
                      >
                        {initials(p.leadAuthor || '?')}
                      </span>
                      <span className="truncate text-[11px] text-slate-600">
                        {p.leadAuthor?.trim() || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-2 py-1 text-[11px] text-slate-700">
                    {formatBudgetShort(Number(p.budget) || 0)}
                  </td>
                  <td className="px-2 py-1">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: progressBarColor(progress),
                          }}
                        />
                      </div>
                      <span className="w-7 text-right text-[10px] font-semibold text-slate-600">
                        {progress}%
                      </span>
                    </div>
                  </td>
                  <td className="max-w-[90px] truncate px-2 py-1 text-[11px] text-slate-600">
                    {p.department || '—'}
                  </td>
                  <td className="px-2 py-1">
                    <span
                      className={`inline-flex items-center rounded-full border px-1.5 py-0.5
                                  text-[9px] font-bold ${statusBadgeClass(String(p.status))}`}
                    >
                      {p.status || '—'}
                    </span>
                  </td>
                  <td className="px-2 py-1">
                    <span className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[9px] text-slate-600">
                      {typeLabel}
                    </span>
                  </td>
                  <td className="px-2 py-1">
                    <button
                      type="button"
                      onClick={() => onViewProject?.(p.id)}
                      className="text-[11px] font-semibold text-[#1a6ec2] hover:underline"
                    >
                      Xem →
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-2 py-6 text-center text-[11px] text-slate-400">
                  Không có đề tài phù hợp bộ lọc
                </td>
              </tr>
            ) : null}
          </tbody>
          {rows.length > 0 ? (
            <tfoot>
              <tr className="bg-[#1a6ec2] text-[11px] font-bold text-white">
                <td className="px-2 py-1.5">Tổng cộng ({rows.length})</td>
                <td className="px-2 py-1.5">—</td>
                <td className="px-2 py-1.5">{formatBudgetShort(totalBudget)}</td>
                <td className="px-2 py-1.5">{avgProgress}%</td>
                <td className="px-2 py-1.5" colSpan={4} />
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>

      {rows.length > visibleCount ? (
        <div className="border-t border-slate-100 px-2 py-1.5 text-center">
          <button
            type="button"
            onClick={() => {
              if (visibleCount + PAGE_SIZE >= rows.length && onViewMore) {
                onViewMore();
                return;
              }
              setVisibleCount((n) => n + PAGE_SIZE);
            }}
            className="text-[11px] font-semibold text-[#1a6ec2] hover:underline"
          >
            Xem thêm
          </button>
        </div>
      ) : null}
    </div>
  );
}
