import { CalendarIcon } from './progressIcons.js';
import { avatarTintFromString, tagColorClasses } from './colorHash.js';
import type { KanbanTask } from './types.js';

type TaskCardProps = {
  task: KanbanTask;
  onOpen: () => void;
};

export function TaskCard({ task, onOpen }: TaskCardProps) {
  const progressPct = task.progressPct ?? 0;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="mb-2 cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-600">
          THƯỜNG
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <CalendarIcon className="h-3 w-3 text-slate-400" aria-hidden />
          {task.dueDate}
        </span>
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-800 transition-colors hover:text-blue-600">
        {task.title}
      </h3>

      <div className="mt-2 flex flex-wrap gap-1">
        {(task.categories?.length ? task.categories : ['TIẾN ĐỘ']).map((tag) => (
          <span
            key={tag}
            className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-slate-500"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-2 rounded-xl bg-slate-50/50 p-2.5 text-xs">
        <p>
          <span className="text-slate-400">Bắt đầu:</span>{' '}
          <span className="font-medium text-slate-600">{task.startDate ?? '—'}</span>
        </p>
        <p className="mt-1">
          <span className="text-slate-400">Kết thúc:</span>{' '}
          <span className="font-medium text-slate-600">{task.endDate ?? task.dueDate}</span>
        </p>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[10px] font-medium text-slate-500">
          <span>Tiến độ</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        {task.unit ? (
          <span
            className={`max-w-[55%] truncate rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-widest ${tagColorClasses(task.unit)}`}
          >
            {task.unit}
          </span>
        ) : (
          <span />
        )}
        {task.owner ? (
          <span className="flex min-w-0 items-center gap-1.5 text-slate-500">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${avatarTintFromString(task.owner)}`}
            >
              {task.owner.trim().charAt(0).toUpperCase() || '?'}
            </span>
            <span className="truncate">{task.owner}</span>
          </span>
        ) : null}
      </div>
    </article>
  );
}
