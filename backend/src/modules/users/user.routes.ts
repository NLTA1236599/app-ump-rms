import { Router } from 'express';
import { listUsers } from './user.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const userRoutes = Router();

userRoutes.use(requireAuth);
userRoutes.get('/', listUsers);
