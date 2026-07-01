import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import {
  deleteUser,
  getAllUsers,
  getPermissions,
  updatePermission,
  updateUserRole,
} from './admin.controller.js';

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireRole('admin'));

adminRoutes.get('/users', getAllUsers);
adminRoutes.patch('/users/:id/role', updateUserRole);
adminRoutes.delete('/users/:id', deleteUser);

adminRoutes.get('/permissions', getPermissions);
adminRoutes.put('/permissions/:feature', updatePermission);
