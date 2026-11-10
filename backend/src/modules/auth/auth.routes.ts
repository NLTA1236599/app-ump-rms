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
import { loginLimiter, otpLimiter } from '../../middleware/rateLimits.js';

export const authRoutes = Router();

function methodNotAllowed(allowed: string[]) {
  return (_req: Request, res: Response) => {
    res.set('Allow', allowed.join(', '));
    res.status(405).json({
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Phương thức không được hỗ trợ.' },
    });
  };
}

authRoutes.post('/register', postRegister);
authRoutes.post('/verify-otp', otpLimiter, postVerifyOtp);
authRoutes.post('/resend-otp', otpLimiter, postResendOtp);

authRoutes
  .route('/login')
  .post(loginLimiter, postLogin)
  .all(methodNotAllowed(['POST']));

authRoutes.get('/me', requireAuth, getMe);
authRoutes.get('/features', requireAuth, getMyFeatures);
