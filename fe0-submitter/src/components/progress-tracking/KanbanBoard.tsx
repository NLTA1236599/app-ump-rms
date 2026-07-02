import { KANBAN_COLUMNS } from './kanbanColumns.js';
import { KanbanColumnView } from './KanbanColumn.js';
import type { SaveTaskPayload } from './AddTaskForm.js';
import type { ColumnId, KanbanTask } from './types.js';

type KanbanBoardProps = {
  tasks: KanbanTask[];
  addingToColumnId: ColumnId | null;
  onStartAdd: (id: ColumnId) => void;
  onCloseForm: () => void;
  onSaveTask: (draft: SaveTaskPayload) => void | Promise<void>;
  onOpenTask: (task: KanbanTask) => void;
};

export function KanbanBoard({
  tasks,
  addingToColumnId,
  onStartAdd,
  onCloseForm,
  onSaveTask,
  onOpenTask,
}: KanbanBoardProps) {
  return (
    <div className="grid min-h-[520px] grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
      {KANBAN_COLUMNS.map((column) => (
        <KanbanColumnView
          key={column.id}
          column={column}
          tasks={tasks.filter((task) => task.columnId === column.id)}
          isAdding={addingToColumnId === column.id}
          onStartAdd={onStartAdd}
          onCloseForm={onCloseForm}
          onSaveTask={onSaveTask}
          onOpenTask={onOpenTask}
        />
      ))}
    </div>
  );
}
