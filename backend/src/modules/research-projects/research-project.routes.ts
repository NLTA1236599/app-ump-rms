import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  deleteAllResearchProjects,
  deleteResearchProject,
  getResearchProjects,
  postResearchProjectsBulk,
  postResearchProjectsDeleteMany,
  putResearchProject,
} from './research-project.controller.js';

export const researchProjectRoutes = Router();

researchProjectRoutes.use(requireAuth);
researchProjectRoutes.get('/', getResearchProjects);
researchProjectRoutes.post('/bulk', postResearchProjectsBulk);
researchProjectRoutes.post('/delete-many', postResearchProjectsDeleteMany);
researchProjectRoutes.delete('/all', deleteAllResearchProjects);
researchProjectRoutes.put('/:id', putResearchProject);
researchProjectRoutes.delete('/:id', deleteResearchProject);
