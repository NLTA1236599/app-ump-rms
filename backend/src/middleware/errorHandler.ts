import type { NextFunction, Request, Response } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message =
    err instanceof Error ? err.message : typeof err === 'string' ? err : 'Lỗi không xác định';
  let status =
    err && typeof err === 'object' && 'status' in err && typeof (err as { status: unknown }).status === 'number'
      ? (err as { status: number }).status
      : 500;
  if (
    status >= 500 &&
    err instanceof Error &&
    (err.message.includes('Excel') || err.message.includes('File too large'))
  ) {
    status = 400;
  }
  if (status >= 500) {
    console.error('[API]', status, err);
  }
  res.status(status).json({ error: message });
}
