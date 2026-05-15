import type { NextFunction, Request, Response } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message =
    err instanceof Error ? err.message : typeof err === 'string' ? err : 'Lỗi không xác định';
  const status =
    err && typeof err === 'object' && 'status' in err && typeof (err as { status: unknown }).status === 'number'
      ? (err as { status: number }).status
      : 500;
  res.status(status).json({ error: message });
}
