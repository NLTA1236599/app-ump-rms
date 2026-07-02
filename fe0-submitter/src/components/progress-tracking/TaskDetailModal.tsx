import type { MouseEvent, PointerEvent } from 'react';
import { CalendarIcon } from './progressIcons.js';
import { KANBAN_COLUMNS } from './kanbanColumns.js';
import { tagColorClasses } from './colorHash.js';
import type { KanbanTask } from './types.js';

type TaskDetailModalProps = {
  task: KanbanTask | null;
  open: boolean;
  onClose: () => void;
};

function overlayPointerDown(close: () => void) {
  return (event: MouseEvent<HTMLDivElement> | PointerEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) close();
  };
}

export function TaskDetailModal({ task, open, onClose }: TaskDetailModalProps) {
  if (!open || !task) return null;

  const theme = KANBAN_COLUMNS.find((col) => col.id === task.columnId)?.theme;
  const headerTone = theme?.modalHeader ?? 'bg-blue-600';

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onMouseDown={overlayPointerDown(onClose)}
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby="task-detail-title"
        className="mx-auto flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[40px] bg-white shadow-2xl animate-slideUp"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={`relative ${headerTone} p-6 text-white`}>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg leading-none text-white backdrop-blur-md transition-colors hover:bg-white/30"
          >
            ×
          </button>
          <span className="inline-flex rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
            Chi tiết Công việc
          </span>
          <div className="my-6 border-b border-dashed border-white/30" />
          <p id="task-detail-title" className="text-lg font-semibold leading-snug">
            {task.title}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 overflow-y-auto p-6">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Chủ nhiệm</p>
            <p className="text-sm font-medium text-slate-800">{task.owner || '—'}</p>
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Thời hạn</p>
            <p className="flex items-center gap-1 text-sm font-medium text-slate-700">
              <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
              {task.dueDate}
            </p>
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</p>
            <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">
              {KANBAN_COLUMNS.find((c) => c.id === task.columnId)?.label ?? '—'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Khoa/Đơn vị</p>
            {task.unit ? (
              <span
                className={`inline-flex rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-widest ${tagColorClasses(task.unit)}`}
              >
                {task.unit}
              </span>
            ) : (
              <p className="text-sm text-slate-400">—</p>
            )}
          </div>
        </div>

        <footer className="flex justify-end gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Đóng
          </button>
        </footer>
      </div>
    </div>
  );
}
