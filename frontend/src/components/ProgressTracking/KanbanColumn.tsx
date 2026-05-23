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
      className={`flex min-h-[520px] flex-col rounded-2xl border p-4 ${theme.bg} ${theme.border}`}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.title}`}>{label}</h3>
        <span
          className={`flex h-6 min-w-[1.5rem] items-center justify-center rounded-full border bg-white px-1 text-xs font-medium text-slate-500 ${theme.badgeBorder}`}
        >
          {tasks.length}
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={() => onOpenTask(task)} />
        ))}
      </div>

      <div className={`mt-auto pt-3`}>
        {isAdding ? (
          <AddTaskForm columnId={id} onClose={onCloseForm} onSave={onSaveTask} />
        ) : (
          <AddTaskFooterButton theme={theme} onClick={() => onStartAdd(id)} />
        )}
      </div>
    </section>
  );
}
