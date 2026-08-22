import { useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarIcon } from './progressIcons.js';
import { avatarTintFromString, tagColorClasses } from './colorHash.js';
import type { KanbanTask } from './types.js';

type TaskCardFaceProps = {
  task: KanbanTask;
};

/** Visual card only — used by both the board slot and the drag overlay. */
export function TaskCardFace({ task }: TaskCardFaceProps) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex items-start justify-between gap-1">
        <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-amber-600">
          THƯỜNG
        </span>
        <span className="flex min-w-0 items-center gap-0.5 text-[10px] text-slate-400">
          <CalendarIcon className="h-2.5 w-2.5 shrink-0 text-slate-400" aria-hidden />
          <span className="truncate">{task.dueDate}</span>
        </span>
      </div>

      <h3
        className="mt-1 line-clamp-2 text-[11px] font-semibold leading-snug text-slate-800"
        title={task.title}
      >
        {task.title}
      </h3>

      {task.categories?.length ? (
        <div className="mt-1 flex flex-wrap gap-0.5">
          {task.categories.map((tag) => (
            <span
              key={tag}
              className="rounded bg-slate-100 px-1 py-px text-[8px] font-semibold uppercase text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-1 flex flex-wrap gap-0.5">
          <span className="rounded bg-slate-100 px-1 py-px text-[8px] font-semibold uppercase text-slate-500">
            TIẾN ĐỘ
          </span>
        </div>
      )}

      <div className="mt-1.5 rounded-md bg-slate-50/50 px-1.5 py-1 text-[10px] leading-snug">
        <p>
          <span className="text-slate-400">Bắt đầu:</span>{' '}
          <span className="font-medium text-slate-600">—</span>
        </p>
        <p>
          <span className="text-slate-400">Kết thúc:</span>{' '}
          <span className="font-medium text-slate-600">{task.dueDate}</span>
        </p>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-1 text-[10px]">
        {task.unit ? (
          <span
            className={`max-w-[50%] truncate rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide ${tagColorClasses(task.unit)}`}
            title={task.unit}
          >
            {task.unit}
          </span>
        ) : (
          <span />
        )}
        {task.owner ? (
          <span className="flex min-w-0 items-center gap-1 text-slate-500" title={task.owner}>
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white ${avatarTintFromString(task.owner)}`}
            >
              {task.owner.trim().charAt(0).toUpperCase() || '?'}
            </span>
            <span className="truncate">{task.owner}</span>
          </span>
        ) : null}
      </div>

      {task.note ? (
        <p className="mt-1 line-clamp-2 rounded-md border border-slate-100 bg-white p-1 text-[10px] italic text-slate-500">
          {task.note}
        </p>
      ) : null}
    </div>
  );
}

type TaskCardProps = {
  task: KanbanTask;
  onOpen: () => void;
};

/**
 * Compact task card — spec §9 essentials (populate state beyond empty board).
 */
export function TaskCard({ task, onOpen }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const suppressClick = useRef(false);

  useEffect(() => {
    if (isDragging) suppressClick.current = true;
  }, [isDragging]);

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
        visibility: isDragging ? 'hidden' : 'visible',
      }}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        onOpen();
      }}
      className="mb-1.5 min-w-0 cursor-grab touch-none"
    >
      <TaskCardFace task={task} />
    </article>
  );
}
