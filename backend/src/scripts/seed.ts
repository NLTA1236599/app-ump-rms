import '../config/env.js';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { createAuthService } from '../backend/compositionRoot.js';
import { WorkspaceService } from '../modules/workspaces/workspace.service.js';
import { IssueService } from '../modules/issues/issue.service.js';

const SALT_ROUNDS = 12;
/** Login email nltanh@ump.edu.vn → API username `nltanh`. */
const ADMIN_SEED_USERNAME = process.env.SEED_ADMIN_USERNAME ?? 'nltanh';
const ADMIN_SEED_DISPLAY_NAME = process.env.SEED_ADMIN_DISPLAY_NAME ?? 'Quản trị viên';
const ADMIN_SEED_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'nltanh1995#';

async function main() {
  const auth = createAuthService();
  const workspaces = new WorkspaceService();
  const issues = new IssueService();

  const { rows: existing } = await pool.query('SELECT id FROM users WHERE username = $1', [
    ADMIN_SEED_USERNAME,
  ]);
  let userId: string;
  if (existing[0]) {
    userId = existing[0].id as string;
    const hash = await bcrypt.hash(ADMIN_SEED_PASSWORD, SALT_ROUNDS);
    await pool.query(
      `UPDATE users SET password = $1, role = $2, display_name = $3 WHERE id = $4`,
      [hash, 'admin', ADMIN_SEED_DISPLAY_NAME, userId]
    );
    console.log(
      `Updated admin "${ADMIN_SEED_USERNAME}" (đăng nhập: ${ADMIN_SEED_USERNAME}@ump.edu.vn).`
    );
  } else {
    const u = await auth.register(
      ADMIN_SEED_USERNAME,
      ADMIN_SEED_PASSWORD,
      'admin',
      ADMIN_SEED_DISPLAY_NAME
    );
    userId = u.id;
    console.log(
      `Created admin "${ADMIN_SEED_USERNAME}" (đăng nhập: ${ADMIN_SEED_USERNAME}@ump.edu.vn).`
    );
  }

  let ws = await pool.query('SELECT id FROM workspaces WHERE key_prefix = $1', ['DEMO']);
  let workspaceId: string;
  if (ws.rows[0]) {
    workspaceId = ws.rows[0].id as string;
    console.log('Workspace DEMO already exists.');
  } else {
    const w = await workspaces.create({
      keyPrefix: 'DEMO',
      name: 'Demo project',
      description: 'Sample Jira-style board',
    });
    workspaceId = w.id;
    console.log('Created workspace DEMO');
  }

  const { rows: issueCount } = await pool.query(
    'SELECT COUNT(*)::int AS c FROM issues WHERE workspace_id = $1',
    [workspaceId]
  );
  if ((issueCount[0]?.c as number) > 0) {
    console.log('Issues already seeded, skipping sample issues.');
  } else {
    await issues.create(workspaceId, userId, {
      summary: 'Welcome to the board',
      description: 'Drag cards between columns. Create issues from the header.',
      issueType: 'story',
      priority: 'high',
      status: 'todo',
    });
    await issues.create(workspaceId, userId, {
      summary: 'Fix login redirect',
      issueType: 'bug',
      priority: 'medium',
      status: 'in_progress',
    });
    await issues.create(workspaceId, userId, {
      summary: 'Write API docs',
      issueType: 'task',
      priority: 'low',
      status: 'backlog',
    });
    console.log('Sample issues created.');
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
