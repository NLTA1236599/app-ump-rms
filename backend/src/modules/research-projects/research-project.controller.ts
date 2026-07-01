import type { NextFunction, Request, Response } from 'express';
import type { JwtUserPayload } from '../../types/index.js';
import { ResearchProjectService } from './research-project.service.js';
import { asPathParam } from '../../utils/pathParams.js';

const service = new ResearchProjectService();

function getUserId(req: Request): string {
  return (req as Request & { user: JwtUserPayload }).user.id;
}

export async function getResearchProjects(_req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await service.list();
    res.json(projects);
  } catch (e) {
    next(e);
  }
}

export async function postResearchProjectsBulk(req: Request, res: Response, next: NextFunction) {
  try {
    const { projects, importFileId } = req.body ?? {};
    if (!Array.isArray(projects) || projects.length === 0) {
      return res.status(400).json({ error: 'projects phải là mảng không rỗng' });
    }

    const saved = await service.bulkCreate(
      projects as Record<string, unknown>[],
      getUserId(req),
      importFileId != null ? String(importFileId) : null,
    );
    res.status(201).json(saved);
  } catch (e) {
    next(e);
  }
}

export async function putResearchProject(req: Request, res: Response, next: NextFunction) {
  try {
    const id = asPathParam(req.params.id);
    const project = req.body ?? {};
    if (!project || typeof project !== 'object') {
      return res.status(400).json({ error: 'Dữ liệu đề tài không hợp lệ' });
    }

    const saved = await service.upsert({ ...project, id }, getUserId(req));
    if (!saved) return res.status(404).json({ error: 'Không tìm thấy đề tài' });
    res.json(saved);
  } catch (e) {
    next(e);
  }
}

export async function deleteResearchProject(req: Request, res: Response, next: NextFunction) {
  try {
    const id = asPathParam(req.params.id);
    const ok = await service.remove(id);
    if (!ok) return res.status(404).json({ error: 'Không tìm thấy đề tài' });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

export async function postResearchProjectsDeleteMany(req: Request, res: Response, next: NextFunction) {
  try {
    const { ids } = req.body ?? {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids phải là mảng không rỗng' });
    }
    const count = await service.removeMany(ids.map(String));
    res.json({ deleted: count });
  } catch (e) {
    next(e);
  }
}

export async function deleteAllResearchProjects(_req: Request, res: Response, next: NextFunction) {
  try {
    const count = await service.removeAll();
    res.json({ deleted: count });
  } catch (e) {
    next(e);
  }
}
