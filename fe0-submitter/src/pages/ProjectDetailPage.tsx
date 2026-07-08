import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  canSubmitterEditProject,
  fetchProjectById,
} from '../api/projectDetailService.js';
import { researchProjectService } from '../api/researchProjectService.js';
import { ProjectDetail } from '../components/project-detail/index.js';
import { useAuthStore } from '../store/authStore.js';
import type { ResearchProject } from '../types/researchProject.js';
import type { SubmitterProjectStatus } from '../types/submitter.js';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [project, setProject] = useState<ResearchProject | null>(null);
  const [submitterStatus, setSubmitterStatus] = useState<SubmitterProjectStatus | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user?.id) return;
    const projectId = id;
    const identity = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
    };

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const result = await fetchProjectById(projectId, identity);
        if (cancelled) return;
        if (!result) {
          setLoadError('Không tìm thấy đề tài.');
          setProject(null);
          return;
        }
        setProject(result.project);
        setSubmitterStatus(result.submitterStatus);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, user?.id, user?.username, user?.email, user?.displayName]);

  const handleBack = useCallback(() => {
    navigate('/de-tai');
  }, [navigate]);

  const handleEdit = useCallback(
    (target: ResearchProject) => {
      if (!canSubmitterEditProject(submitterStatus)) return;
      navigate('/de-tai/dang-ky', { state: { editProjectId: target.id } });
    },
    [navigate, submitterStatus],
  );

  const handleUpdateProject = useCallback(async (updated: ResearchProject) => {
    try {
      const saved = await researchProjectService.upsert(updated);
      setProject(saved);
    } catch {
      setProject(updated);
    }
  }, []);

  const handleSyncProject = useCallback((updated: ResearchProject) => {
    setProject(updated);
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-64 rounded bg-slate-100" />
          <div className="h-32 w-full rounded bg-slate-50" />
          <div className="h-96 w-full rounded bg-slate-50" />
        </div>
      </div>
    );
  }

  if (loadError || !project) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-700">{loadError ?? 'Không tìm thấy đề tài.'}</p>
        <button
          type="button"
          onClick={handleBack}
          className="mt-4 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const canEdit = canSubmitterEditProject(submitterStatus);

  return (
    <div className="-mx-8 -my-8 overflow-hidden">
      <ProjectDetail
        project={project}
        onBack={handleBack}
        onEdit={handleEdit}
        onUpdateProject={handleUpdateProject}
        onSyncProject={handleSyncProject}
        canEdit={canEdit}
        canDelete={false}
        canEditProgress={false}
      />
    </div>
  );
}
