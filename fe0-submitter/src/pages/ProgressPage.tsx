import { useEffect, useState } from 'react';

import { ProgressTrackingPage } from '../components/progress-tracking/index.js';
import { fetchMyProjects } from '../api/projectService.js';
import { useAuthStore } from '../store/authStore.js';
import type { SubmitterProject } from '../types/submitter.js';

export function ProgressPage() {
  const user = useAuthStore((state) => state.user);
  const [projects, setProjects] = useState<SubmitterProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const identity = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    let cancelled = false;

    async function loadProjects() {
      setIsLoading(true);
      try {
        const data = await fetchMyProjects(identity);
        if (!cancelled) setProjects(data);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.username, user?.email]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-48 rounded bg-slate-100" />
          <div className="h-32 w-full rounded bg-slate-50" />
          <div className="h-64 w-full rounded bg-slate-50" />
        </div>
      </div>
    );
  }

  return (
    <ProgressTrackingPage
      projects={projects}
      ownerLabel={user?.displayName ?? user?.username ?? 'Chủ nhiệm đề tài'}
    />
  );
}
