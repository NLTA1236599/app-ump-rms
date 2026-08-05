import { AdminUserRepository } from '../admin/admin-user.repository.js';
import { MilestoneSyncService } from '../reminders/milestoneSync.service.js';
import {
  expandAllowedDepartments,
  projectMatchesAllowedUnits,
} from './departmentAccess.js';
import { ResearchProjectRepository } from './research-project.repository.js';

const UNRESTRICTED_ROLES = new Set(['admin', 'leader']);

export class ResearchProjectService {
  private readonly repo = new ResearchProjectRepository();
  private readonly users = new AdminUserRepository();
  private readonly milestones = new MilestoneSyncService();

  async listForUser(userId: string, roleFromToken: string) {
    const all = await this.repo.findAll();

    if (UNRESTRICTED_ROLES.has(roleFromToken)) {
      return all;
    }

    const access = await this.users.findAllowedUnitsById(userId);
    if (!access) {
      return all;
    }

    if (UNRESTRICTED_ROLES.has(access.role)) {
      return all;
    }

    // Empty allowed_units = see all (same semantics as fe0-admin UI).
    if (access.allowed_units.length === 0) {
      return all;
    }

    const allowed = new Set(expandAllowedDepartments(access.allowed_units));
    return all.filter((project) => projectMatchesAllowedUnits(project.department, allowed));
  }

  list() {
    return this.repo.findAll();
  }

  async bulkCreate(
    projects: Record<string, unknown>[],
    userId: string,
    importFileId?: string | null,
  ) {
    const saved = await this.repo.insertMany(projects, userId, importFileId);
    await Promise.all(
      saved.map((project) => this.milestones.syncProject(String(project.id), project)),
    );
    return saved;
  }

  async upsert(project: Record<string, unknown>, userId: string) {
    const saved = await this.repo.upsert(project, userId);
    if (saved?.id) {
      await this.milestones.syncProject(String(saved.id), saved);
    }
    return saved;
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
