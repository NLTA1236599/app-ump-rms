import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../backend/config/jwt.js';
import { pool } from '../config/database.js';
import type { JwtUserPayload } from '../types/index.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
    });
  }
  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtUserPayload;
    (req as Request & { user: JwtUserPayload }).user = payload;
    next();
  } catch {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Token không hợp lệ hoặc đã hết hạn' },
    });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: JwtUserPayload }).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Không có quyền thực hiện thao tác này' },
      });
    }
    next();
  };
}

/** Admin check against the live DB role, not only the JWT claim (T10). */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as Request & { user?: JwtUserPayload }).user;
  if (!user) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
    });
  }
  try {
    const { rows } = await pool.query<{ role: string }>(
      'SELECT role FROM users WHERE id = $1',
      [user.id]
    );
    if (!rows[0] || rows[0].role !== 'admin') {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Không có quyền thực hiện thao tác này' },
      });
    }
    next();
  } catch (e) {
    next(e);
  }
}
