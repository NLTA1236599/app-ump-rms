import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { saveResearchProject } from '../api/researchProjectService.js';
import { DataEntryPage } from '../components/data-entry/index.js';
import { useAuthStore } from '../store/authStore.js';
import { resolveSubmitterEmail } from '../utils/submitterEmail.js';
import type { ResearchProject } from '../types/researchProject.js';

export function RegisterProjectPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const handleSaveProject = useCallback(
    async (project: ResearchProject) => {
      const payload: ResearchProject = {
        ...project,
        leadAuthor: project.leadAuthor || user?.displayName || user?.username || '',
        principalEmail:
          project.principalEmail ||
          (user ? resolveSubmitterEmail(user) : undefined) ||
          undefined,
      };

      try {
        await saveResearchProject(payload);
      } catch {
        // Form still confirms save locally when API is unavailable.
      }
    },
    [user?.displayName, user?.username, user?.email],
  );

  const handleCancel = useCallback(() => {
    navigate('/de-tai');
  }, [navigate]);

  return <DataEntryPage mode="create" onSaveProject={handleSaveProject} onCancel={handleCancel} />;
}
