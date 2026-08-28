import { AdminUserRepository } from '../admin/admin-user.repository.js';
import { MilestoneSyncService } from '../reminders/milestoneSync.service.js';
import {
  expandAllowedDepartments,
  projectMatchesAllowedUnits,
} from './departmentAccess.js';
import { projectMatchesAllowedTypes } from './projectTypeAccess.js';
import { httpError, isUniqueViolation } from './pgErrors.js';
import { normalizeProjectContactFields } from './projectContactFields.js';
import { ResearchProjectRepository } from './research-project.repository.js';
import { extractReviewYear, isNewRegistrationStatus } from './reviewYear.js';

const UNRESTRICTED_ROLES = new Set(['admin', 'leader']);
const SEQUENCE_CONFLICT =
  'Số thứ tự đã được chuyên viên khác lấy trong năm xét duyệt này.';

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

    // Empty allowed_units = see all departments; empty allowed_project_types = see all types.
    let visible = all;
    if (access.allowed_units.length > 0) {
      const allowed = new Set(expandAllowedDepartments(access.allowed_units));
      visible = visible.filter((project) => projectMatchesAllowedUnits(project.department, allowed));
    }
    if (access.allowed_project_types.length > 0) {
      const allowedTypes = new Set(access.allowed_project_types);
      visible = visible.filter((project) =>
        projectMatchesAllowedTypes(project.categories, allowedTypes),
      );
    }
    return visible;
  }

  list() {
    return this.repo.findAll();
  }

  resolveSequenceYear(project: Record<string, unknown>): number | null {
    const fromBatch = extractReviewYear(String(project.reviewBatch ?? ''));
    if (fromBatch) return fromBatch;
    const stored = Number(project.registrationSequenceYear);
    if (Number.isInteger(stored) && stored >= 1990) return stored;
    return null;
  }

  async bulkCreate(
    projects: Record<string, unknown>[],
    userId: string,
    importFileId?: string | null,
  ) {
    const normalized = await Promise.all(
      projects.map((project) => normalizeProjectContactFields(project)),
    );
    try {
      const saved = await this.repo.insertMany(normalized, userId, importFileId);
      await Promise.all(
        saved.map((project) => this.milestones.syncProject(String(project.id), project)),
      );
      return saved;
    } catch (e) {
      if (isUniqueViolation(e)) throw httpError(SEQUENCE_CONFLICT, 409);
      throw e;
    }
  }

  async upsert(project: Record<string, unknown>, userId: string) {
    const normalized = await normalizeProjectContactFields(project);
    const needsSequence = isNewRegistrationStatus(normalized.status);
    const year = needsSequence ? this.resolveSequenceYear(normalized) : null;
    if (needsSequence && !year) {
      throw httpError('Vui lòng chọn đợt xét duyệt để lấy số thứ tự theo năm.', 400);
    }

    let saved: Record<string, unknown> | null;
    try {
      saved = await this.repo.upsert(normalized, userId, needsSequence ? year : null);
    } catch (e) {
      if (isUniqueViolation(e)) throw httpError(SEQUENCE_CONFLICT, 409);
      throw e;
    }
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
