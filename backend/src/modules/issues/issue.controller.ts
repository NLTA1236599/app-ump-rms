import type { NextFunction, Request, Response } from 'express';
import { IssueService } from './issue.service.js';
import { asPathParam } from '../../utils/pathParams.js';

const service = new IssueService();

export async function listIssues(req: Request, res: Response, next: NextFunction) {
  try {
    const workspaceId = asPathParam(req.params.workspaceId);
    const list = await service.list(workspaceId);
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function createIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const reporter = (req as Request & { user: { id: string } }).user;
    const { summary, description, issueType, priority, status, assigneeId } = req.body ?? {};
    if (!summary) {
      return res.status(400).json({ error: 'summary là bắt buộc' });
    }
    const workspaceId = asPathParam(req.params.workspaceId);
    const issue = await service.create(workspaceId, reporter.id, {
      summary: String(summary),
      ...(description !== undefined ? { description: String(description) } : {}),
      ...(issueType !== undefined ? { issueType: String(issueType) } : {}),
      ...(priority !== undefined ? { priority: String(priority) } : {}),
      ...(status !== undefined ? { status: String(status) } : {}),
      ...(assigneeId !== undefined ? { assigneeId: assigneeId as string | null } : {}),
    });
    res.status(201).json(issue);
  } catch (e) {
    next(e);
  }
}

export async function reorderIssues(req: Request, res: Response, next: NextFunction) {
  try {
    const { items } = req.body ?? {};
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items phải là mảng' });
    }
    const workspaceId = asPathParam(req.params.workspaceId);
    const list = await service.reorderBoard(
      workspaceId,
      items as Array<{ id: string; status: string; position: number }>
    );
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function patchIssueInWorkspace(req: Request, res: Response, next: NextFunction) {
  try {
    const workspaceId = asPathParam(req.params.workspaceId);
    const issueId = asPathParam(req.params.issueId);
    const issue = await service.update(workspaceId, issueId, {
      ...(req.body.summary !== undefined ? { summary: String(req.body.summary) } : {}),
      ...(req.body.description !== undefined ? { description: String(req.body.description) } : {}),
      ...(req.body.issueType !== undefined ? { issueType: String(req.body.issueType) } : {}),
      ...(req.body.priority !== undefined ? { priority: String(req.body.priority) } : {}),
      ...(req.body.status !== undefined ? { status: String(req.body.status) } : {}),
      ...(req.body.assigneeId !== undefined
        ? { assigneeId: req.body.assigneeId as string | null }
        : {}),
      ...(req.body.position !== undefined ? { position: Number(req.body.position) } : {}),
    });
    if (!issue) return res.status(404).json({ error: 'Không tìm thấy issue' });
    res.json(issue);
  } catch (e) {
    next(e);
  }
}

export async function deleteIssueInWorkspace(req: Request, res: Response, next: NextFunction) {
  try {
    const workspaceId = asPathParam(req.params.workspaceId);
    const issueId = asPathParam(req.params.issueId);
    const ok = await service.remove(workspaceId, issueId);
    if (!ok) return res.status(404).json({ error: 'Không tìm thấy issue' });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
