import { useCallback, useEffect, useState } from 'react';
import { issueService } from '../services/index.js';
import type { Issue } from '../types/index.js';

export function useBoardIssues(workspaceId: string | null) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await issueService.list(workspaceId);
      setIssues(data);
    } catch {
      setError('Could not load issues.');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createIssue = useCallback(
    async (body: Parameters<(typeof issueService)['create']>[1]) => {
      if (!workspaceId) throw new Error('No workspace selected');
      const created = await issueService.create(workspaceId, body);
      setIssues((prev) => [...prev, created]);
      return created;
    },
    [workspaceId]
  );

  const patchIssue = useCallback(
    async (issueId: string, body: Parameters<(typeof issueService)['patch']>[2]) => {
      if (!workspaceId) throw new Error('No workspace selected');
      const updated = await issueService.patch(workspaceId, issueId, body);
      setIssues((prev) => prev.map((i) => (i.id === issueId ? updated : i)));
      return updated;
    },
    [workspaceId]
  );

  const removeIssue = useCallback(
    async (issueId: string) => {
      if (!workspaceId) throw new Error('No workspace selected');
      await issueService.remove(workspaceId, issueId);
      setIssues((prev) => prev.filter((i) => i.id !== issueId));
    },
    [workspaceId]
  );

  const reorder = useCallback(
    async (items: Array<{ id: string; status: Issue['status']; position: number }>) => {
      if (!workspaceId) throw new Error('No workspace selected');
      const next = await issueService.reorderBoard(workspaceId, items);
      setIssues(next);
    },
    [workspaceId]
  );

  return {
    issues,
    loading,
    error,
    reload,
    createIssue,
    patchIssue,
    removeIssue,
    reorder,
  };
}
