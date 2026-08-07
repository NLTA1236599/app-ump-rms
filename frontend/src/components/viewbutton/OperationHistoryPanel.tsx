import { formatDate } from '../DataTable/formatDate.js';
import type { HistoryEntry, ResearchProject } from '../DataTable/types.js';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    const dateOnly = formatDate(iso);
    return dateOnly || iso;
  }
  const date = d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return `${date} ${time}`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function avatarColor(name: string): string {
  const palette = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-indigo-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  const changes = entry.changes ?? [];

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div
          title={entry.user}
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full
                      text-xs font-bold text-white ${avatarColor(entry.user || 'Hệ thống')}`}
        >
          {getInitials(entry.user || 'Hệ thống')}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-sm font-bold text-blue-600">{entry.user || 'Hệ thống'}</p>
            <p className="text-xs text-slate-400">{formatDateTime(entry.timestamp)}</p>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-800">{entry.action}</p>

          {changes.length > 0 ? (
            <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
              {changes.map((change) => (
                <li key={`${entry.timestamp}-${change.field}`} className="text-sm">
                  <p className="font-semibold text-slate-700">{change.label}</p>
                  <p className="mt-0.5 flex flex-wrap items-start gap-x-2 gap-y-1 text-slate-600">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-500 line-through">
                      {change.oldValue}
                    </span>
                    <span className="text-slate-400" aria-hidden>
                      →
                    </span>
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-800">
                      {change.newValue}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function OperationHistoryPanel({ project }: { project: ResearchProject }) {
  const history = project.history ?? [];

  return (
    <div className="p-6">
      <div className="mb-4">
        <h4 className="border-l-4 border-blue-500 pl-3 text-sm font-bold text-blue-600">
          Lịch sử thao tác
        </h4>
        <p className="mt-1 pl-4 text-xs text-slate-500">
          Theo dõi người thao tác, thời gian và nội dung thay đổi trên dữ liệu đề tài.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-600">Chưa có lịch sử thao tác</p>
          <p className="mt-1 text-xs text-slate-400">
            Các lần tạo mới, chỉnh sửa hoặc nhập Excel sẽ được ghi lại tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry, index) => (
            <HistoryCard key={`${entry.timestamp}-${entry.user}-${index}`} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
