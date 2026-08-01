import { Router } from 'express';
import {
  getMe,
  postLogin,
  postRegister,
  postResendOtp,
  postVerifyOtp,
} from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const authRoutes = Router();

authRoutes.post('/register', postRegister);
authRoutes.post('/verify-otp', postVerifyOtp);
authRoutes.post('/resend-otp', postResendOtp);
authRoutes.post('/login', postLogin);
authRoutes.get('/me', requireAuth, getMe);
