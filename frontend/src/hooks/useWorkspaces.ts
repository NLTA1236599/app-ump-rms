import { useCallback, useEffect, useState } from 'react';
import { workspaceService } from '../services/index.js';
import type { Workspace } from '../types/index.js';

export function useWorkspaces(enabled: boolean) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workspaceService.getAll();
      setWorkspaces(data);
    } catch {
      setError('Could not load workspaces.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) void refresh();
  }, [enabled, refresh]);

  const create = useCallback(async (payload: { keyPrefix: string; name: string; description?: string }) => {
    const w = await workspaceService.create(payload);
    setWorkspaces((prev) => [w, ...prev]);
    return w;
  }, []);

  const remove = useCallback(async (id: string) => {
    await workspaceService.delete(id);
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return { workspaces, isLoading, error, refresh, create, remove };
}
