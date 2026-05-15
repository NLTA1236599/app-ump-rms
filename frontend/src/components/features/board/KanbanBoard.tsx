import { useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BOARD_STATUSES, STATUS_CONFIG, issueTypeBadge, priorityBadge } from './statusConfig.js';
import type { Issue, IssueStatus } from '../../../types/index.js';

export function flattenItems(idsByStatus: Record<IssueStatus, string[]>): Array<{
  id: string;
  status: IssueStatus;
  position: number;
}> {
  const out: Array<{ id: string; status: IssueStatus; position: number }> = [];
  for (const status of BOARD_STATUSES) {
    idsByStatus[status].forEach((id, position) => {
      out.push({ id, status, position });
    });
  }
  return out;
}

function itemsFromIssues(issues: Issue[]): Record<IssueStatus, string[]> {
  const buckets = BOARD_STATUSES.reduce(
    (acc, status) => {
      acc[status] = [];
      return acc;
    },
    {} as Record<IssueStatus, string[]>
  );
  for (const status of BOARD_STATUSES) {
    buckets[status] = issues
      .filter((i) => i.status === status)
      .sort((a, b) => a.position - b.position || a.issueNumber - b.issueNumber)
      .map((i) => i.id);
  }
  return buckets;
}

function resolveContainer(idsByStatus: Record<IssueStatus, string[]>, id: string): IssueStatus | undefined {
  if ((BOARD_STATUSES as string[]).includes(id)) {
    return id as IssueStatus;
  }
  for (const s of BOARD_STATUSES) {
    if (idsByStatus[s].includes(id)) return s;
  }
  return undefined;
}

function computeNextCols(
  prev: Record<IssueStatus, string[]>,
  activeId: string,
  overId: string
): Record<IssueStatus, string[]> | null {
  const activeColumn = resolveContainer(prev, activeId);

  let overColumn = resolveContainer(prev, overId);
  if (!activeColumn) return null;
  if (!overColumn && (BOARD_STATUSES as string[]).includes(overId)) {
    overColumn = overId as IssueStatus;
  }
  if (!overColumn) return null;

  if (activeColumn === overColumn) {
    const idxActive = prev[activeColumn].indexOf(activeId);
    let idxOver = prev[activeColumn].indexOf(overId);
    if (idxActive === -1) return null;

    if (idxOver === -1) {
      if ((BOARD_STATUSES as string[]).includes(overId)) {
        idxOver = prev[activeColumn].length - 1;
      } else {
        return null;
      }
    }

    if (idxActive === idxOver) return null;

    return {
      ...prev,
      [activeColumn]: arrayMove(prev[activeColumn], idxActive, idxOver),
    };
  }

  const from = [...prev[activeColumn]];
  const activeIndex = from.indexOf(activeId);
  if (activeIndex === -1) return null;
  from.splice(activeIndex, 1);

  const dest = [...prev[overColumn]];
  let insertIndex = dest.length;

  const overIsCardInDest = dest.includes(overId);
  if (overIsCardInDest) {
    insertIndex = dest.indexOf(overId);
  } else if ((BOARD_STATUSES as string[]).includes(overId)) {
    insertIndex = dest.length;
  }

  dest.splice(insertIndex, 0, activeId);

  return {
    ...prev,
    [activeColumn]: from,
    [overColumn]: dest,
  };
}

function SortableIssueCard({
  issue,
  onOpen,
}: {
  issue: Issue;
  onOpen: (issue: Issue) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: issue.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  const onKeyActivate = (e: ReactKeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(issue);
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpen(issue);
        }}
        className={`mb-2 w-full cursor-grab rounded-md border border-jira-border bg-jira-card p-3 text-left shadow-sm transition hover:border-blue-400 active:cursor-grabbing ${
          isDragging ? 'ring-2 ring-blue-400' : ''
        }`}
        aria-label={`Open issue ${issue.key}`}
        onKeyDown={onKeyActivate}
      >
        <div className="flex items-start gap-2">
          <span
            className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${issueTypeBadge(issue.issueType)}`}
          >
            {issue.issueType}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-blue-900">{issue.key}</div>
            <div className="line-clamp-3 text-sm text-slate-900">{issue.summary}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
              <span className={priorityBadge(issue.priority)}>{issue.priority}</span>
              {issue.assignee ? (
                <span className="truncate rounded-full bg-slate-100 px-2 py-0.5">
                  @{issue.assignee.displayName ?? issue.assignee.username}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

function BoardColumn({
  status,
  ids,
  issuesById,
  onOpenIssue,
}: {
  status: IssueStatus;
  ids: string[];
  issuesById: Map<string, Issue>;
  onOpenIssue: (issue: Issue) => void;
}) {
  const { setNodeRef } = useDroppable({ id: status });
  const cfg = STATUS_CONFIG[status];

  return (
    <section className="flex w-[300px] shrink-0 flex-col rounded-lg bg-white ring-1 ring-jira-border">
      <div className={`flex items-center gap-2 rounded-t-lg px-3 py-2 text-sm font-semibold ${cfg.headerClass}`}>
        <span className={`h-2 w-2 rounded-full ${cfg.dotClass}`} />
        {cfg.label}
        <span className="ml-auto rounded-full bg-black/10 px-2 py-0.5 text-[11px] font-bold">{ids.length}</span>
      </div>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="min-h-[120px] flex-1 bg-jira-column p-2">
          {ids.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
              Drop issues here
            </div>
          ) : (
            ids.map((id) => {
              const issue = issuesById.get(id);
              if (!issue) return null;
              return <SortableIssueCard key={id} issue={issue} onOpen={onOpenIssue} />;
            })
          )}
        </div>
      </SortableContext>
    </section>
  );
}

export function KanbanBoard({
  issues,
  onPersistOrder,
  onOpenIssue,
}: {
  issues: Issue[];
  onPersistOrder: (
    ordered: Array<{ id: string; status: IssueStatus; position: number }>
  ) => Promise<void>;
  onOpenIssue: (issue: Issue) => void;
}) {
  const issuesById = useMemo(() => new Map(issues.map((i) => [i.id, i])), [issues]);
  const serverCols = useMemo(() => itemsFromIssues(issues), [issues]);

  const [optimistic, setOptimistic] = useState<Record<IssueStatus, string[]> | null>(null);
  useEffect(() => setOptimistic(null), [issues]);

  const cols = optimistic ?? serverCols;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const over = event.over;
    if (!over || !issuesById.has(activeId)) return;

    const overId = String(over.id);
    const nextCols = computeNextCols(cols, activeId, overId);
    if (!nextCols) return;

    setOptimistic(nextCols);
    try {
      await onPersistOrder(flattenItems(nextCols));
    } catch {
      setOptimistic(null);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {BOARD_STATUSES.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            ids={cols[status]}
            issuesById={issuesById}
            onOpenIssue={onOpenIssue}
          />
        ))}
      </div>
    </DndContext>
  );
}
