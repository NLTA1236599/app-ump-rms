import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../backend/config/jwt.js';
import type { JwtUserPayload } from '../types/index.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }
  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtUserPayload;
    (req as Request & { user: JwtUserPayload }).user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: JwtUserPayload }).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Không có quyền thực hiện thao tác này' });
    }
    next();
  };
}
