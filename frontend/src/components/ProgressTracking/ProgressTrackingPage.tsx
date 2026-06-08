import { useMemo, useState } from 'react';
import type { ResearchProject } from '../DataTable/types.js';
import type { SaveTaskPayload } from './AddTaskForm.js';
import { KanbanBoard } from './KanbanBoard.js';
import { KanbanSectionHeader, type KanbanViewMode } from './KanbanSectionHeader.js';
import { NotificationsPanel } from './NotificationsPanel.js';
import { CalendarPlaceholder } from './CalendarPlaceholder.js';
import { TaskDetailModal } from './TaskDetailModal.js';
import {
  buildProjectAnnouncements,
  projectToKanbanTask,
} from './projectProgressSync.js';
import type { ColumnId, KanbanTask } from './types.js';

function makeTaskId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export type ProgressTrackingPageProps = {
  projects?: ResearchProject[];
};

/**
 * Full “Tiến độ thực hiện” page body (zones 1‑3 inside the authenticated shell).
 * Matches `ProgressTracking-final-spec.md`; notification copy follows §3 canonical list.
 */
export function ProgressTrackingPage({ projects = [] }: ProgressTrackingPageProps) {
  const [view, setView] = useState<KanbanViewMode>('kanban');
  const [manualTasks, setManualTasks] = useState<KanbanTask[]>([]);

  const projectTasks = useMemo(() => projects.map(projectToKanbanTask), [projects]);
  const tasks = useMemo(() => [...projectTasks, ...manualTasks], [projectTasks, manualTasks]);
  const announcements = useMemo(() => buildProjectAnnouncements(projects), [projects]);

  /** `review` pre‑opened aligns with screenshot evidence (first column composing a task). */
  const [addingToColumnId, setAddingToColumnId] = useState<ColumnId | null>(
    projects.length > 0 ? null : 'review',
  );

  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const focusedTask = useMemo(
    () => tasks.find((task) => task.id === focusedTaskId) ?? null,
    [focusedTaskId, tasks],
  );

  const handleSaveTask = (draft: SaveTaskPayload) => {
    const next: KanbanTask = {
      id: makeTaskId(),
      columnId: draft.columnId,
      title: draft.title,
      owner: draft.owner,
      unit: draft.unit,
      dueDate: draft.dueDateDisplay,
      categories: ['ĐỀ CƯƠNG'],
    };

    setManualTasks((prev) => [next, ...prev]);
    setFocusedTaskId(null);
  };

  return (
    <div className="animate-fadeIn space-y-4">
      <NotificationsPanel items={announcements} />

      <KanbanSectionHeader view={view} onViewChange={setView} />

      {view === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          addingToColumnId={addingToColumnId}
          onStartAdd={(columnId) => setAddingToColumnId(columnId)}
          onCloseForm={() => setAddingToColumnId(null)}
          onSaveTask={handleSaveTask}
          onOpenTask={(task) => setFocusedTaskId(task.id)}
        />
      ) : (
        <CalendarPlaceholder />
      )}

      <TaskDetailModal
        task={focusedTask}
        open={focusedTask !== null}
        onClose={() => setFocusedTaskId(null)}
      />
    </div>
  );
}
