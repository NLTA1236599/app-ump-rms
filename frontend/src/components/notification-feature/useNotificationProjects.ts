import { useCallback, useEffect, useState } from 'react';

import type { ResearchProject } from '../DataTable/types.js';
import { researchProjectService } from '../../services/index.js';

const POLL_INTERVAL_MS = 30_000;

type UseNotificationProjectsResult = {
  projects: ResearchProject[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useNotificationProjects(): UseNotificationProjectsResult {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const data = await researchProjectService.getAll();
      setProjects(data);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Không tải được dữ liệu thông báo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await researchProjectService.getAll();
        if (!cancelled) {
          setProjects(data);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Không tải được dữ liệu thông báo');
          setProjects([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    const interval = setInterval(() => {
      void load();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { projects, loading, error, refetch };
}
