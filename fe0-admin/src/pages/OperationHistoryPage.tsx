import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getResearchProjects,
  type HistoryEntry,
  type ResearchProjectRow,
} from '../api/researchProjectService.js';

export type OperationLogItem = {
  id: string;
  projectId: string;
  projectTitle: string;
  contractId: string;
  projectCode: string;
  department: string;
  entry: HistoryEntry;
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function flattenHistory(projects: ResearchProjectRow[]): OperationLogItem[] {
  const items: OperationLogItem[] = [];

  for (const project of projects) {
    const history = project.history ?? [];
    history.forEach((entry, index) => {
      items.push({
        id: `${project.id}-${entry.timestamp}-${index}`,
        projectId: project.id,
        projectTitle: project.title?.trim() || '(Chưa có tên đề tài)',
        contractId: project.contractId?.trim() || '—',
        projectCode: project.projectCode?.trim() || '—',
        department: project.department?.trim() || '—',
        entry,
      });
    });
  }

  return items.sort(
    (a, b) => new Date(b.entry.timestamp).getTime() - new Date(a.entry.timestamp).getTime(),
  );
}

export function OperationHistoryPage() {
  const [items, setItems] = useState<OperationLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const projects = await getResearchProjects();
      setItems(flattenHistory(projects));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được lịch sử thao tác');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const haystack = [
        item.entry.user,
        item.entry.action,
        item.projectTitle,
        item.contractId,
        item.projectCode,
        item.department,
        ...(item.entry.changes ?? []).flatMap((c) => [c.label, c.oldValue, c.newValue]),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query]);

  if (loading) return <p className="text-gray-500">Đang tải…</p>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lịch sử thao tác</h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi thay đổi trên bảng Dữ liệu đề tài: người thao tác, thời gian và nội dung
            thay đổi.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void refresh();
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Làm mới
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo người thao tác, đề tài, số HĐ, nội dung…"
          className="w-full max-w-xl rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="mb-3 text-sm text-gray-500">
        {filtered.length} thao tác
        {query.trim() ? ` (lọc từ ${items.length})` : ''}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-gray-600">Chưa có lịch sử thao tác</p>
          <p className="mt-1 text-xs text-gray-400">
            Các lần tạo / sửa / nhập Excel đề tài trên frontend sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const changes = item.entry.changes ?? [];
            const isOpen = expandedId === item.id;
            return (
              <article
                key={item.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <p className="text-sm font-bold text-blue-700">
                        {item.entry.user || 'Hệ thống'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(item.entry.timestamp)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-800">{item.entry.action}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-semibold text-gray-700">{item.projectTitle}</span>
                      <span className="text-gray-400"> · </span>
                      HĐ: {item.contractId}
                      <span className="text-gray-400"> · </span>
                      Mã: {item.projectCode}
                    </p>
                    <p className="text-xs text-gray-400">{item.department}</p>
                  </div>

                  {changes.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setExpandedId(isOpen ? null : item.id)}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs
                                 font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      {isOpen ? 'Thu gọn' : `Chi tiết (${changes.length})`}
                    </button>
                  ) : null}
                </div>

                {isOpen && changes.length > 0 ? (
                  <ul className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                    {changes.map((change) => (
                      <li key={`${item.id}-${change.field}`} className="text-sm">
                        <p className="font-semibold text-gray-700">{change.label}</p>
                        <p className="mt-0.5 flex flex-wrap items-start gap-x-2 gap-y-1 text-gray-600">
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-500 line-through">
                            {change.oldValue}
                          </span>
                          <span className="text-gray-400" aria-hidden>
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
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
