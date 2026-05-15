import { WorkspaceRepository } from './workspace.repository.js';
import type { Workspace } from '../../types/index.js';

export class WorkspaceService {
  constructor(private readonly repo = new WorkspaceRepository()) {}

  list(): Promise<Workspace[]> {
    return this.repo.findAll();
  }

  async get(id: string): Promise<Workspace | null> {
    return this.repo.findById(id);
  }

  async create(input: { keyPrefix: string; name: string; description?: string }): Promise<Workspace> {
    const prefix = input.keyPrefix.trim().toUpperCase();
    if (!/^[A-Z][A-Z0-9]{1,15}$/.test(prefix)) {
      throw Object.assign(new Error('keyPrefix phải là 2–16 ký tự A–Z hoặc số, bắt đầu bằng chữ'), {
        status: 400,
      });
    }
    const dup = await this.repo.findByKeyPrefix(prefix);
    if (dup) {
      throw Object.assign(new Error('Key workspace đã tồn tại'), { status: 409 });
    }
    return this.repo.insert({ ...input, keyPrefix: prefix });
  }

  async update(
    id: string,
    patch: Partial<{ keyPrefix: string; name: string; description: string }>
  ): Promise<Workspace | null> {
    if (patch.keyPrefix) {
      const prefix = patch.keyPrefix.trim().toUpperCase();
      if (!/^[A-Z][A-Z0-9]{1,15}$/.test(prefix)) {
        throw Object.assign(new Error('keyPrefix không hợp lệ'), { status: 400 });
      }
      const dup = await this.repo.findByKeyPrefix(prefix);
      if (dup && dup.id !== id) {
        throw Object.assign(new Error('Key workspace đã tồn tại'), { status: 409 });
      }
      patch = { ...patch, keyPrefix: prefix };
    }
    return this.repo.update(id, patch);
  }

  async remove(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}
