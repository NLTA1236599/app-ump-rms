import express from 'express';
import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRoutes } from './modules/auth/auth.routes.js';
import { workspaceRoutes } from './modules/workspaces/workspace.routes.js';
import { workspaceIssueRoutes } from './modules/issues/issue.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

/** Comma-separated list in FRONTEND_ORIGIN (e.g. local Vite + Docker UI hostnames). */
function resolveCorsOrigin(): CorsOptions['origin'] {
  const raw = process.env.FRONTEND_ORIGIN?.trim();
  if (!raw) return 'http://localhost:5173';
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) return 'http://localhost:5173';
  return list.length === 1 ? list[0] : list;
}

app.use(helmet());
app.use(
  cors({
    origin: resolveCorsOrigin(),
    credentials: true,
  })
);
app.use('/api/v1/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 40 }));
app.use(express.json({ limit: '2mb' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/workspaces/:workspaceId/issues', workspaceIssueRoutes);
app.use('/api/v1/users', userRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

export default app;
