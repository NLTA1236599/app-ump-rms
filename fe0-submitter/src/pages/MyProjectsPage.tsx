import { useEffect, useState } from 'react';

import { fetchMyProjects } from '../api/projectService.js';
import { PageHeader } from '../components/my-projects/PageHeader.js';
import { ProjectListCard } from '../components/my-projects/ProjectListCard.js';
import { useAuthStore } from '../store/authStore.js';
import type { StatusFilterId, SubmitterProject } from '../types/submitter.js';

export function MyProjectsPage() {
  const user = useAuthStore((state) => state.user);
  const [projects, setProjects] = useState<SubmitterProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<StatusFilterId>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
      <>
        <PageHeader />
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-40 rounded bg-slate-100" />
            <div className="h-10 w-full rounded bg-slate-50" />
            <div className="h-12 w-full rounded bg-slate-50" />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader />
      <ProjectListCard
        projects={projects}
        activeStatus={activeStatus}
        searchTerm={searchTerm}
        onStatusChange={setActiveStatus}
        onSearchChange={setSearchTerm}
      />
    </>
  );
}
