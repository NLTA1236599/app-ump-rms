import type { Request, Response, NextFunction } from 'express';
import { authService } from '../../backend/compositionRoot.js';
import { mapAuthDatabaseError } from './mapAuthDatabaseError.js';

function clientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0]?.trim() || req.ip || 'unknown';
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export async function postRegister(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password, displayName } = req.body ?? {};
    if (!username || !password) {
      return res.status(400).json({ error: 'username và password là bắt buộc' });
    }
    const result = await authService.register(
      String(username),
      String(password),
      displayName ? String(displayName) : undefined
    );
    res.status(201).json(result);
  } catch (e) {
    next(mapAuthDatabaseError(e));
  }
}

export async function postVerifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp } = req.body ?? {};
    if (!email || !otp) {
      return res.status(400).json({ error: 'email và otp là bắt buộc' });
    }
    await authService.verifyOtp(String(email), String(otp));
    res.json({ ok: true });
  } catch (e) {
    next(mapAuthDatabaseError(e));
  }
}

export async function postResendOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body ?? {};
    if (!email) {
      return res.status(400).json({ error: 'email là bắt buộc' });
    }
    const result = await authService.resendOtp(String(email), clientIp(req));
    res.json(result);
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
