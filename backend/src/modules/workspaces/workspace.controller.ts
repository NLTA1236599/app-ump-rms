import type { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from './workspace.service.js';
import { asPathParam } from '../../utils/pathParams.js';

const service = new WorkspaceService();

export async function getWorkspaces(_req: Request, res: Response, next: NextFunction) {
  try {
    const list = await service.list();
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function postWorkspace(req: Request, res: Response, next: NextFunction) {
  try {
    const { keyPrefix, name, description } = req.body ?? {};
    if (!keyPrefix || !name) {
      return res.status(400).json({ error: 'keyPrefix và name là bắt buộc' });
    }
    const w = await service.create({
      keyPrefix: String(keyPrefix),
      name: String(name),
      description: description != null ? String(description) : undefined,
    });
    res.status(201).json(w);
  } catch (e) {
    next(e);
  }
}

export async function getWorkspace(req: Request, res: Response, next: NextFunction) {
  try {
    const id = asPathParam(req.params.id);
    const w = await service.get(id);
    if (!w) return res.status(404).json({ error: 'Không tìm thấy workspace' });
    res.json(w);
  } catch (e) {
    next(e);
  }
}

export async function patchWorkspace(req: Request, res: Response, next: NextFunction) {
  try {
    const { keyPrefix, name, description } = req.body ?? {};
    const id = asPathParam(req.params.id);
    const w = await service.update(id, {
      ...(keyPrefix != null ? { keyPrefix: String(keyPrefix) } : {}),
      ...(name != null ? { name: String(name) } : {}),
      ...(description != null ? { description: String(description) } : {}),
    });
    if (!w) return res.status(404).json({ error: 'Không tìm thấy workspace' });
    res.json(w);
  } catch (e) {
    next(e);
  }
}

export async function deleteWorkspace(req: Request, res: Response, next: NextFunction) {
  try {
    const id = asPathParam(req.params.id);
    const ok = await service.remove(id);
    if (!ok) return res.status(404).json({ error: 'Không tìm thấy workspace' });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
