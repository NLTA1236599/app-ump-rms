import type { NextFunction, Request, Response } from 'express';

function looksLikeInternalDetail(message: string): boolean {
  return /relation |syntax error|duplicate key|ECONNREFUSED|password authentication|stack|at Object\.|node_modules/i.test(
    message
  );
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const rawMessage =
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

  const publicMessage =
    status >= 500 || looksLikeInternalDetail(rawMessage)
      ? 'Đã xảy ra lỗi hệ thống.'
      : rawMessage;

  res.status(status).json({
    error: {
      code: status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
      message: publicMessage,
    },
  });
}
