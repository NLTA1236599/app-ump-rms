import dotenv from 'dotenv';
import { pool } from '../config/database.js';
import { AuthService } from '../modules/auth/auth.service.js';
import { WorkspaceService } from '../modules/workspaces/workspace.service.js';
import { IssueService } from '../modules/issues/issue.service.js';

dotenv.config();

async function main() {
  const auth = new AuthService();
  const workspaces = new WorkspaceService();
  const issues = new IssueService();

  const { rows: existing } = await pool.query('SELECT id FROM users WHERE username = $1', [
    'admin',
  ]);
  let userId: string;
  if (existing[0]) {
    userId = existing[0].id as string;
    console.log('User admin already exists.');
  } else {
    const u = await auth.register('admin', 'admin123', 'admin', 'Admin');
    userId = u.id;
    console.log('Created admin / admin123');
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
