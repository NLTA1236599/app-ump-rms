import { AddTaskForm } from './AddTaskForm.js';
import type { SaveTaskPayload } from './AddTaskForm.js';
import { AddTaskFooterButton } from './AddTaskFooterButton.js';
import { TaskCard } from './TaskCard.js';
import type { ColumnConfig, ColumnId, KanbanTask } from './types.js';

type KanbanColumnViewProps = {
  column: ColumnConfig;
  tasks: KanbanTask[];
  isAdding: boolean;
  onStartAdd: (id: ColumnId) => void;
  onCloseForm: () => void;
  onSaveTask: (draft: SaveTaskPayload) => void | Promise<void>;
  onOpenTask: (task: KanbanTask) => void;
};

/** Spec §6 — shared column scaffold */
export function KanbanColumnView({
  column,
  tasks,
  isAdding,
  onStartAdd,
  onCloseForm,
  onSaveTask,
  onOpenTask,
}: KanbanColumnViewProps) {
  const { theme, label, id } = column;

  return (
    <section
      className={`flex min-h-[min(62vh,420px)] min-w-0 flex-col rounded-xl border p-2 ${theme.bg} ${theme.border}`}
    >
      <header className="mb-2 flex items-start justify-between gap-1">
        <h3
          className={`min-w-0 text-[10px] font-bold uppercase leading-tight tracking-wide ${theme.title}`}
          title={label}
        >
          {label}
        </h3>
        <span
          className={`flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full border bg-white px-1 text-[10px] font-medium text-slate-500 ${theme.badgeBorder}`}
        >
          {tasks.length}
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pb-1">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={() => onOpenTask(task)} />
        ))}
      </div>

      <div className="mt-auto pt-2">
        {isAdding ? (
          <AddTaskForm columnId={id} onClose={onCloseForm} onSave={onSaveTask} />
        ) : (
          <AddTaskFooterButton theme={theme} onClick={() => onStartAdd(id)} />
        )}
      </div>
    </section>
  );
}
