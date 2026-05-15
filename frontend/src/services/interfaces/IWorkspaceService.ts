import type { Workspace } from '../../types/index.js';

export interface IWorkspaceService {
  getAll(): Promise<Workspace[]>;
  getById(id: string): Promise<Workspace>;
  create(payload: { keyPrefix: string; name: string; description?: string }): Promise<Workspace>;
  update(
    id: string,
    patch: Partial<{ keyPrefix: string; name: string; description: string }>
  ): Promise<Workspace>;
  delete(id: string): Promise<void>;
}
