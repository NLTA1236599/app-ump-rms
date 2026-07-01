import type { ResearchProject } from '../../components/DataTable/types.js';
import { httpClient } from './httpClient.js';

type ImportFileRecord = {
  id: string;
  originalName: string;
  filename: string;
  filePath: string;
  rowCount: number;
  uploadedBy: string;
  createdAt: string;
};

export class ApiResearchProjectService {
  getAll(): Promise<ResearchProject[]> {
    return httpClient.get<ResearchProject[]>('/research-projects');
  }

  bulkCreate(projects: ResearchProject[], importFileId?: string): Promise<ResearchProject[]> {
    return httpClient.post<ResearchProject[]>('/research-projects/bulk', {
      projects,
      importFileId,
    });
  }

  upsert(project: ResearchProject): Promise<ResearchProject> {
    return httpClient.put<ResearchProject>(`/research-projects/${project.id}`, project);
  }

  deleteOne(id: string): Promise<void> {
    return httpClient.delete<void>(`/research-projects/${id}`);
  }

  deleteMany(ids: string[]): Promise<{ deleted: number }> {
    return httpClient.post<{ deleted: number }>('/research-projects/delete-many', { ids });
  }

  deleteAll(): Promise<{ deleted: number }> {
    return httpClient.delete<{ deleted: number }>('/research-projects/all');
  }

  uploadImportFile(file: File, rowCount: number): Promise<{ file: ImportFileRecord }> {
    return httpClient.uploadFormData<{ file: ImportFileRecord }>('/files', file, {
      rowCount: String(rowCount),
    });
  }
}
