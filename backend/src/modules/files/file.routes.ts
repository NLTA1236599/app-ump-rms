import { Router } from 'express';
import { upload } from '../../config/multer.js';
import { requireAuth } from '../../middleware/auth.js';
import { listImportFiles, uploadImportFile } from './file.controller.js';

export const fileRoutes = Router();

fileRoutes.use(requireAuth);
fileRoutes.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return next(err);
    void uploadImportFile(req, res, next);
  });
});
fileRoutes.get('/', listImportFiles);
