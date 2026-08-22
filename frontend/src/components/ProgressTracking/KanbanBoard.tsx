import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KANBAN_COLUMNS } from './kanbanColumns.js';
import type { SaveTaskPayload } from './AddTaskForm.js';
import { KanbanColumnView } from './KanbanColumn.js';
import { isKanbanColumnId } from './projectProgressSync.js';
import { TaskCardFace } from './TaskCard.js';
import type { ColumnId, KanbanTask } from './types.js';

type KanbanBoardProps = {
  tasks: KanbanTask[];
  addingToColumnId: ColumnId | null;
  onStartAdd: (id: ColumnId) => void;
  onCloseForm: () => void;
  onSaveTask: (draft: SaveTaskPayload) => void | Promise<void>;
  onOpenTask: (task: KanbanTask) => void;
  onMoveTask: (taskId: string, toColumn: ColumnId) => void;
};

function resolveDropColumn(tasks: KanbanTask[], overId: string): ColumnId | undefined {
  if (isKanbanColumnId(overId)) return overId;
  return tasks.find((task) => task.id === overId)?.columnId;
}

function setDraggingCursor(on: boolean) {
  document.body.classList.toggle('kanban-dragging', on);
}

/** Zone 3 — responsive 4-column board (spec §5) */
export function KanbanBoard({
  tasks,
  addingToColumnId,
  onStartAdd,
  onCloseForm,
  onSaveTask,
  onOpenTask,
  onMoveTask,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeWidth, setActiveWidth] = useState<number | undefined>();
  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : undefined;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setActiveWidth(event.active.rect.current.initial?.width);
    setDraggingCursor(true);
  };

  const finishDrag = () => {
    setActiveId(null);
    setActiveWidth(undefined);
    setDraggingCursor(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const over = event.over;
    const taskId = String(event.active.id);
    const task = tasks.find((item) => item.id === taskId);

    finishDrag();

    if (!over || !task) return;
    const toColumn = resolveDropColumn(tasks, String(over.id));
    if (!toColumn || toColumn === task.columnId) return;
    onMoveTask(taskId, toColumn);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragCancel={finishDrag}
      onDragEnd={handleDragEnd}
    >
      <div className="grid min-h-0 grid-cols-4 gap-2">
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

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div style={{ width: activeWidth }} className="cursor-grabbing">
            <TaskCardFace task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
