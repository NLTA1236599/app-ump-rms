import { httpClient } from './httpClient.js';
import type { IWorkspaceService } from '../interfaces/IWorkspaceService.js';
import type { Workspace } from '../../types/index.js';

export class ApiWorkspaceService implements IWorkspaceService {
  async getAll() {
    return httpClient.get<Workspace[]>('/workspaces');
  }

  async getById(id: string) {
    return httpClient.get<Workspace>(`/workspaces/${id}`);
  }

  async create(payload: { keyPrefix: string; name: string; description?: string }) {
    return httpClient.post<Workspace>('/workspaces', payload);
  }

  async update(
    id: string,
    patch: Partial<{ keyPrefix: string; name: string; description: string }>
  ) {
    return httpClient.patch<Workspace>(`/workspaces/${id}`, patch);
  }

  async delete(id: string) {
    await httpClient.delete<void>(`/workspaces/${id}`);
  }
}
