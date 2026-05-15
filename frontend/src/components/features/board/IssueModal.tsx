import { useEffect, useState } from 'react';
import { BOARD_STATUSES, STATUS_CONFIG } from './statusConfig.js';
import type { Issue, IssuePriority, IssueStatus, IssueType, User } from '../../../types/index.js';
import { Button } from '../../ui/Button.js';
import { Input } from '../../ui/Input.js';
import { Modal } from '../../ui/Modal.js';

const TYPES: IssueType[] = ['story', 'task', 'bug', 'epic'];
const PRIOS: IssuePriority[] = ['lowest', 'low', 'medium', 'high', 'highest'];

export function IssueModal({
  open,
  mode,
  issue,
  workspaceKey,
  assignees,
  onClose,
  onCreate,
  onSave,
  onDelete,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  issue: Issue | null;
  workspaceKey: string | null;
  assignees: User[];
  onClose: () => void;
  onCreate: (draft: {
    summary: string;
    description: string;
    issueType: IssueType;
    priority: IssuePriority;
    status: IssueStatus;
    assigneeId: string | null;
  }) => Promise<void>;
  onSave: (
    issueId: string,
    draft: Partial<{
      summary: string;
      description: string;
      issueType: IssueType;
      priority: IssuePriority;
      status: IssueStatus;
      assigneeId: string | null;
    }>
  ) => Promise<void>;
  onDelete?: (issueId: string) => Promise<void>;
}) {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState<IssueType>('task');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [status, setStatus] = useState<IssueStatus>('todo');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setBusy(false);
    if (mode === 'edit' && issue) {
      setSummary(issue.summary);
      setDescription(issue.description ?? '');
      setIssueType(issue.issueType as IssueType);
      setPriority(issue.priority as IssuePriority);
      setStatus(issue.status as IssueStatus);
      setAssigneeId(issue.assigneeId ?? '');
    }
    if (mode === 'create') {
      setSummary('');
      setDescription('');
      setIssueType('task');
      setPriority('medium');
      setStatus('todo');
      setAssigneeId('');
    }
  }, [open, mode, issue]);

  const footer = (
    <div className="flex justify-between gap-2">
      {mode === 'edit' && issue && onDelete ? (
        <Button
          variant="danger"
          type="button"
          disabled={busy}
          className="mr-auto"
          onClick={async () => {
            if (!issue || !confirm('Delete this issue?')) return;
            setBusy(true);
            try {
              await onDelete(issue.id);
              onClose();
            } catch {
              setError('Could not delete issue');
              setBusy(false);
            }
          }}
        >
          Delete
        </Button>
      ) : (
        <span />
      )}
      <div className="flex gap-2">
        <Button variant="secondary" type="button" disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" form="issue-form" disabled={busy}>
          {busy ? 'Saving…' : mode === 'create' ? 'Create issue' : 'Save changes'}
        </Button>
      </div>
    </div>
  );

  const title =
    mode === 'create'
      ? `New issue ${workspaceKey ? `• ${workspaceKey}` : ''}`
      : issue
        ? `Edit ${issue.key}`
        : 'Issue';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (!summary.trim()) {
        throw new Error('Summary is required');
      }
      if (mode === 'create') {
        await onCreate({
          summary: summary.trim(),
          description,
          issueType,
          priority,
          status,
          assigneeId: assigneeId === '' ? null : assigneeId,
        });
        onClose();
      } else if (issue) {
        await onSave(issue.id, {
          summary: summary.trim(),
          description,
          issueType,
          priority,
          status,
          assigneeId: assigneeId === '' ? null : assigneeId,
        });
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title={title} onClose={onClose} footer={footer}>
      <form id="issue-form" className="space-y-4" onSubmit={submit}>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Summary</label>
          <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Concise headline" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Type</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as IssueType)}
              className="w-full rounded-md border border-jira-border bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as IssuePriority)}
              className="w-full rounded-md border border-jira-border bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {PRIOS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as IssueStatus)}
            className="w-full rounded-md border border-jira-border bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {BOARD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Assignee</label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full rounded-md border border-jira-border bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Unassigned</option>
            {assignees.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName ?? u.username}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Description</label>
          <textarea
            className="min-h-[120px] w-full rounded-md border border-jira-border bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Context, acceptance criteria, links …"
          />
        </div>

        {error ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div> : null}
      </form>
    </Modal>
  );
}
