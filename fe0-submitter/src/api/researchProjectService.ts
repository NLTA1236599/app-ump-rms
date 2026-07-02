import type { ResearchProject } from '../types/researchProject.js';
import { httpClient } from './httpClient.js';

export const researchProjectService = {
  getAll(): Promise<ResearchProject[]> {
    return httpClient.get<ResearchProject[]>('/research-projects').then((response) => response.data);
  },

  upsert(project: ResearchProject): Promise<ResearchProject> {
    return httpClient
      .put<ResearchProject>(`/research-projects/${project.id}`, project)
      .then((response) => response.data);
  },
};

export async function saveResearchProject(project: ResearchProject): Promise<ResearchProject> {
  return researchProjectService.upsert(project);
}

export async function bulkCreateResearchProjects(
  projects: ResearchProject[],
): Promise<ResearchProject[]> {
  const { data } = await httpClient.post<ResearchProject[]>('/research-projects/bulk', { projects });
  return data;
}
