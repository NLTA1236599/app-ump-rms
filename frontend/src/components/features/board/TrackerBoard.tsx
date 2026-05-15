import { useEffect, useState } from 'react';
import { HeaderBar, MainLayout, Sidebar } from '../../layout/AppChrome.js';
import { Button } from '../../ui/Button.js';
import { Toast } from '../../ui/Toast.js';
import { WorkspaceModal } from './WorkspaceModal.js';
import { IssueModal } from './IssueModal.js';
import { KanbanBoard } from './KanbanBoard.js';
import type { Issue } from '../../../types/index.js';
import { useWorkspaces } from '../../../hooks/useWorkspaces.js';
import { useBoardIssues } from '../../../hooks/useBoardIssues.js';
import { useAssignableUsers } from '../../../hooks/useAssignableUsers.js';
import { useNotification } from '../../../hooks/useNotification.js';

export function TrackerBoard({
  onLogout,
  userLabel,
}: {
  userLabel: string;
  onLogout: () => void;
}) {
  const { message, notify, dismiss } = useNotification();
  const { workspaces, create } = useWorkspaces(true);
  const [activeWs, setActiveWs] = useState<string | null>(null);

  useEffect(() => {
    setActiveWs((prev) => {
      if (!workspaces.length) return null;
      if (prev && workspaces.some((w) => w.id === prev)) return prev;
      return workspaces[0].id;
    });
  }, [workspaces]);

  const activeWorkspaceId = activeWs;
  const wsEntity = workspaces.find((w) => w.id === activeWorkspaceId) ?? null;

  const assignees = useAssignableUsers(Boolean(activeWorkspaceId));

  const { issues, loading, error, createIssue, patchIssue, removeIssue, reorder } =
    useBoardIssues(activeWorkspaceId);

  const [wsModal, setWsModal] = useState(false);
  const [issueModal, setIssueModal] = useState<{ mode: 'create' | 'edit'; issue: Issue | null } | null>(
    null
  );

  const subtitle = wsEntity?.description ? wsEntity.description : 'Kanban from backlog → done';

  const handleCreateWs = async (payload: { keyPrefix: string; name: string; description?: string }) => {
    const ws = await create(payload);
    setActiveWs(ws.id);
    notify(`Workspace "${ws.name}" ready`);
    return ws;
  };

  const reorderPersist = async (
    ordered: Array<{ id: string; status: Issue['status']; position: number }>
  ) => {
    try {
      await reorder(ordered);
    } catch {
      notify('Could not save board order.');
      throw new Error('reorder failed');
    }
  };

  return (
    <>
      <MainLayout
        sidebar={
          <Sidebar
            workspaces={workspaces}
            activeId={activeWorkspaceId}
            onSelect={(id) => setActiveWs(id)}
            onCreateWorkspace={() => setWsModal(true)}
          />
        }
      >
        <HeaderBar
          title={wsEntity ? `${wsEntity.name} board` : 'Pick a workspace'}
          subtitle={subtitle}
          userLabel={userLabel}
          onLogout={onLogout}
        />

        <div className="flex flex-1 flex-col gap-3 bg-jira-bg p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              disabled={!activeWorkspaceId}
              onClick={() => setIssueModal({ mode: 'create', issue: null })}
            >
              + Create issue
            </Button>
            {loading ? <span className="text-xs text-slate-600">Loading issues…</span> : null}
            {error ? <span className="text-xs text-red-700">{error}</span> : null}
          </div>

          {!activeWorkspaceId ? (
            <div className="rounded-lg border border-dashed border-jira-border bg-white p-8 text-center text-slate-700">
              Create a workspace using the sidebar to open the board.
            </div>
          ) : loading && issues.length === 0 ? (
            <div className="rounded-lg border border-jira-border bg-white p-8 text-center text-slate-600">
              Loading…
            </div>
          ) : (
            <KanbanBoard
              issues={issues}
              onPersistOrder={async (ordered) => await reorderPersist(ordered)}
              onOpenIssue={(issue) => setIssueModal({ mode: 'edit', issue })}
            />
          )}
        </div>
      </MainLayout>

      <WorkspaceModal open={wsModal} onClose={() => setWsModal(false)} onCreate={handleCreateWs} />

      <IssueModal
        open={issueModal !== null}
        mode={issueModal?.mode ?? 'create'}
        issue={issueModal?.issue ?? null}
        workspaceKey={wsEntity?.keyPrefix ?? null}
        assignees={assignees}
        onClose={() => setIssueModal(null)}
        onCreate={async (draft) => {
          await createIssue({
            summary: draft.summary,
            description: draft.description,
            issueType: draft.issueType,
            priority: draft.priority,
            status: draft.status,
            assigneeId: draft.assigneeId ?? undefined,
          });
          notify('Issue created');
        }}
        onSave={async (issueId, draft) => {
          await patchIssue(issueId, draft);
          notify('Issue updated');
        }}
        onDelete={async (issueId) => {
          await removeIssue(issueId);
          notify('Issue deleted');
        }}
      />

      <Toast message={message} onDismiss={dismiss} />
    </>
  );
}
