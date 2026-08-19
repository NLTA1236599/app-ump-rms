import { Router, type Request, type Response } from 'express';
import {
  getMe,
  getMyFeatures,
  postLogin,
  postRegister,
  postResendOtp,
  postVerifyOtp,
} from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const authRoutes = Router();

function methodNotAllowed(allowed: string[]) {
  return (_req: Request, res: Response) => {
    res.set('Allow', allowed.join(', '));
    res.status(405).json({ error: 'Method Not Allowed' });
  };
}

authRoutes.post('/register', postRegister);
authRoutes.post('/verify-otp', postVerifyOtp);
authRoutes.post('/resend-otp', postResendOtp);

// BUG-021: wrong verbs must be 405 (not Express default 404 "Cannot GET …").
authRoutes
  .route('/login')
  .post(postLogin)
  .all(methodNotAllowed(['POST']));

authRoutes.get('/me', requireAuth, getMe);
authRoutes.get('/features', requireAuth, getMyFeatures);
