import type { Request, Response, NextFunction } from 'express';
import { authService } from '../../backend/compositionRoot.js';
import { mapAuthDatabaseError } from './mapAuthDatabaseError.js';

export async function postRegister(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password, role, displayName } = req.body ?? {};
    if (!username || !password) {
      return res.status(400).json({ error: 'username và password là bắt buộc' });
    }
    const user = await authService.register(
      String(username),
      String(password),
      role ? String(role) : 'user',
      displayName ? String(displayName) : undefined
    );
    res.status(201).json({ user });
  } catch (e) {
    next(mapAuthDatabaseError(e));
  }
}

export async function postLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res.status(400).json({ error: 'username và password là bắt buộc' });
    }
    const { token, user } = await authService.login(String(username), String(password));
    res.json({ token, user });
  } catch (e) {
    next(mapAuthDatabaseError(e));
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const u = (req as Request & { user: { id: string } }).user;
    const user = await authService.getProfile(u.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json({ user });
  } catch (e) {
    next(mapAuthDatabaseError(e));
  }
}
