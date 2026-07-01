import type { NextFunction, Request, Response } from 'express';
import type { JwtUserPayload } from '../../types/index.js';
import { ImportFileRepository } from './import-file.repository.js';

const repo = new ImportFileRepository();

export async function uploadImportFile(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = (req as Request & { user: JwtUserPayload }).user;
    const rowCount = Number(req.body?.rowCount ?? 0);

    const record = await repo.insert({
      originalName: file.originalname,
      filename: file.filename,
      filePath: file.path,
      rowCount: Number.isFinite(rowCount) ? rowCount : 0,
      uploadedBy: user.id,
    });

    return res.status(201).json({
      message: 'File uploaded successfully',
      file: record,
    });
  } catch (e) {
    next(e);
  }
}

export async function listImportFiles(_req: Request, res: Response, next: NextFunction) {
  try {
    const files = await repo.findAll();
    res.json({ files });
  } catch (e) {
    next(e);
  }
}
