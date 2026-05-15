import { Router } from 'express';
import {
  createIssue,
  deleteIssueInWorkspace,
  listIssues,
  patchIssueInWorkspace,
  reorderIssues,
} from './issue.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const workspaceIssueRoutes = Router({ mergeParams: true });

workspaceIssueRoutes.use(requireAuth);
workspaceIssueRoutes.get('/', listIssues);
workspaceIssueRoutes.post('/', createIssue);
workspaceIssueRoutes.put('/board', reorderIssues);
workspaceIssueRoutes.patch('/:issueId', patchIssueInWorkspace);
workspaceIssueRoutes.delete('/:issueId', deleteIssueInWorkspace);
