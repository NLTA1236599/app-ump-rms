import { WorkspaceRepository } from '../workspaces/workspace.repository.js';
import {
  IssueRepository,
  isValidPriority,
  isValidStatus,
  isValidType,
} from './issue.repository.js';
import type { Issue, IssuePriority, IssueStatus, IssueType } from '../../types/index.js';

export class IssueService {
  constructor(
    private readonly issues = new IssueRepository(),
    private readonly workspaces = new WorkspaceRepository()
  ) {}

  async list(workspaceId: string): Promise<Issue[]> {
    const w = await this.workspaces.findById(workspaceId);
    if (!w) {
      throw Object.assign(new Error('Không tìm thấy workspace'), { status: 404 });
    }
    return this.issues.listByWorkspace(workspaceId);
  }

  async create(
    workspaceId: string,
    reporterId: string,
    input: {
      summary: string;
      description?: string;
      issueType?: string;
      priority?: string;
      status?: string;
      assigneeId?: string | null;
    }
  ): Promise<Issue> {
    const w = await this.workspaces.findById(workspaceId);
    if (!w) throw Object.assign(new Error('Không tìm thấy workspace'), { status: 404 });

    const summary = input.summary.trim();
    if (!summary) throw Object.assign(new Error('summary không được để trống'), { status: 400 });

    const status: IssueStatus =
      input.status && isValidStatus(input.status) ? input.status : 'todo';
    const issueType: IssueType =
      input.issueType && isValidType(input.issueType) ? input.issueType : 'task';
    const priority: IssuePriority =
      input.priority && isValidPriority(input.priority) ? input.priority : 'medium';

    const issueNumber = await this.issues.nextIssueNumber(workspaceId);
    const position = await this.issues.nextPosition(workspaceId, status);

    return this.issues.insert({
      workspaceId,
      issueNumber,
      summary,
      description: input.description ?? '',
      issueType,
      priority,
      status,
      assigneeId: input.assigneeId === undefined ? null : input.assigneeId,
      reporterId,
      position,
    });
  }

  async update(
    workspaceId: string,
    issueId: string,
    patch: Partial<{
      summary: string;
      description: string;
      issueType: string;
      priority: string;
      status: string;
      assigneeId: string | null;
      position: number;
    }>
  ): Promise<Issue | null> {
    const current = await this.issues.findById(issueId);
    if (!current) return null;
    if (current.workspaceId !== workspaceId) {
      throw Object.assign(new Error('Issue không thuộc workspace này'), { status: 403 });
    }

    const mapped: Partial<{
      summary: string;
      description: string;
      issueType: IssueType;
      priority: IssuePriority;
      status: IssueStatus;
      assigneeId: string | null;
      position: number;
    }> = {};

    if (patch.summary !== undefined) mapped.summary = patch.summary.trim();
    if (patch.description !== undefined) mapped.description = patch.description;
    if (patch.issueType !== undefined && isValidType(patch.issueType)) mapped.issueType = patch.issueType;
    if (patch.priority !== undefined && isValidPriority(patch.priority))
      mapped.priority = patch.priority;
    if (patch.status !== undefined && isValidStatus(patch.status)) mapped.status = patch.status;
    if (patch.assigneeId !== undefined) mapped.assigneeId = patch.assigneeId;
    if (patch.position !== undefined) mapped.position = patch.position;

    return this.issues.updatePatch(issueId, mapped);
  }

  async reorderBoard(workspaceId: string, items: Array<{ id: string; status: string; position: number }>) {
    const w = await this.workspaces.findById(workspaceId);
    if (!w) throw Object.assign(new Error('Không tìm thấy workspace'), { status: 404 });

    const normalized: Array<{ id: string; status: IssueStatus; position: number }> = [];
    for (const it of items) {
      if (!isValidStatus(it.status)) {
        throw Object.assign(new Error(`status không hợp lệ: ${it.status}`), { status: 400 });
      }
      normalized.push({ id: it.id, status: it.status, position: it.position });
    }

    const existing = await this.issues.listByWorkspace(workspaceId);
    const idSet = new Set(existing.map((i) => i.id));
    for (const it of normalized) {
      if (!idSet.has(it.id)) {
        throw Object.assign(new Error('issue không thuộc workspace này'), { status: 400 });
      }
    }

    await this.issues.updatePositions(workspaceId, normalized);
    return this.issues.listByWorkspace(workspaceId);
  }

  async remove(workspaceId: string, issueId: string): Promise<boolean> {
    const current = await this.issues.findById(issueId);
    if (!current || current.workspaceId !== workspaceId) return false;
    return this.issues.delete(issueId);
  }

  async get(issueId: string): Promise<Issue | null> {
    return this.issues.findById(issueId);
  }
}
