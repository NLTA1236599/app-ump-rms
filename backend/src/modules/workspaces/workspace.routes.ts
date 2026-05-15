import { Router } from 'express';
import {
  deleteWorkspace,
  getWorkspace,
  getWorkspaces,
  patchWorkspace,
  postWorkspace,
} from './workspace.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const workspaceRoutes = Router();

workspaceRoutes.use(requireAuth);
workspaceRoutes.get('/', getWorkspaces);
workspaceRoutes.post('/', postWorkspace);
workspaceRoutes.get('/:id', getWorkspace);
workspaceRoutes.patch('/:id', patchWorkspace);
workspaceRoutes.delete('/:id', deleteWorkspace);
