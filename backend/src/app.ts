import express from 'express';
import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import { authRoutes } from './modules/auth/auth.routes.js';
import { workspaceRoutes } from './modules/workspaces/workspace.routes.js';
import { workspaceIssueRoutes } from './modules/issues/issue.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { fileRoutes } from './modules/files/file.routes.js';
import { researchProjectRoutes } from './modules/research-projects/research-project.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { reminderTestRoutes } from './modules/dev/reminderTest.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimits.js';

const app = express();

app.disable('x-powered-by');

// Behind Caddy/Docker reverse proxy (X-Forwarded-For). Required by express-rate-limit.
app.set('trust proxy', 1);

/** Comma-separated list in FRONTEND_ORIGIN (e.g. local Vite + Docker UI hostnames). */
function resolveCorsOrigin(): CorsOptions['origin'] {
  const raw = process.env.FRONTEND_ORIGIN?.trim();
  if (!raw) return 'http://localhost:5173';
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) return 'http://localhost:5173';
  return list.length === 1 ? list[0] : list;
}

app.use(
  helmet({
    // API responses are JSON — block active content by default.
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),
);
app.use(
  cors({
    origin: resolveCorsOrigin(),
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use('/api/v1', apiLimiter);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/workspaces/:workspaceId/issues', workspaceIssueRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/research-projects', researchProjectRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

if (process.env.NODE_ENV !== 'production') {
  app.use('/api/v1/dev/reminders', reminderTestRoutes);
}

app.use('/api', (_req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Không tìm thấy tài nguyên.' },
  });
});

app.use(errorHandler);

export default app;
