import { ResearchProjectRepository } from './research-project.repository.js';

export class ResearchProjectService {
  private readonly repo = new ResearchProjectRepository();

  list() {
    return this.repo.findAll();
  }

  bulkCreate(projects: Record<string, unknown>[], userId: string, importFileId?: string | null) {
    return this.repo.insertMany(projects, userId, importFileId);
  }

  upsert(project: Record<string, unknown>, userId: string) {
    return this.repo.upsert(project, userId);
  }

  async remove(id: string) {
    return this.repo.deleteById(id);
  }

  removeMany(ids: string[]) {
    return this.repo.deleteByIds(ids);
  }

  removeAll() {
    return this.repo.deleteAll();
  }
}
