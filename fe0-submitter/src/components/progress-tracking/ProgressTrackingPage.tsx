import { useMemo, useState } from 'react';

import type { SaveTaskPayload } from './AddTaskForm.js';
import { CalendarPlaceholder } from './CalendarPlaceholder.js';
import { KanbanBoard } from './KanbanBoard.js';
import { KanbanSectionHeader, type KanbanViewMode } from './KanbanSectionHeader.js';
import { NotificationsPanel } from './NotificationsPanel.js';
import {
  buildSubmitterAnnouncements,
  mergeKanbanTasks,
  submitterProjectToKanbanTask,
} from './submitterProgressSync.js';
import { TaskDetailModal } from './TaskDetailModal.js';
import type { SubmitterProject } from '../../types/submitter.js';
import type { ColumnId, KanbanTask } from './types.js';

function makeTaskId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export type ProgressTrackingPageProps = {
  projects?: SubmitterProject[];
  ownerLabel?: string;
};

export function ProgressTrackingPage({
  projects = [],
  ownerLabel = 'Chủ nhiệm đề tài',
}: ProgressTrackingPageProps) {
  const [view, setView] = useState<KanbanViewMode>('kanban');
  const [manualTasks, setManualTasks] = useState<KanbanTask[]>([]);
  const [addingToColumnId, setAddingToColumnId] = useState<ColumnId | null>(null);
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);

  const projectTasks = useMemo(
    () => projects.map((project) => submitterProjectToKanbanTask(project, ownerLabel)),
    [projects, ownerLabel],
  );
  const tasks = useMemo(
    () => [...mergeKanbanTasks(projectTasks), ...manualTasks],
    [projectTasks, manualTasks],
  );
  const announcements = useMemo(() => buildSubmitterAnnouncements(projects), [projects]);

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
      endDate: draft.dueDateDisplay,
      startDate: '—',
      progressPct: 10,
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
