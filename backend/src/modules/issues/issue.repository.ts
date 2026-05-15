import { pool } from '../../config/database.js';
import type { Issue, IssuePriority, IssueStatus, IssueType } from '../../types/index.js';

const VALID_STATUSES: IssueStatus[] = ['backlog', 'todo', 'in_progress', 'in_review', 'done'];
const VALID_TYPES: IssueType[] = ['story', 'task', 'bug', 'epic'];
const VALID_PRIORITIES: IssuePriority[] = ['lowest', 'low', 'medium', 'high', 'highest'];

export function isValidStatus(s: string): s is IssueStatus {
  return VALID_STATUSES.includes(s as IssueStatus);
}

export function isValidType(s: string): s is IssueType {
  return VALID_TYPES.includes(s as IssueType);
}

export function isValidPriority(s: string): s is IssuePriority {
  return VALID_PRIORITIES.includes(s as IssuePriority);
}

interface IssueRow {
  id: string;
  workspace_id: string;
  issue_number: number;
  summary: string;
  description: string;
  issue_type: string;
  priority: string;
  status: string;
  assignee_id: string | null;
  reporter_id: string;
  position: number;
  created_at: string;
  updated_at: string;
  key_prefix: string;
  assignee_username?: string | null;
  assignee_display_name?: string | null;
}

export function rowToIssue(r: IssueRow): Issue {
  return {
    id: r.id,
    workspaceId: r.workspace_id,
    issueNumber: r.issue_number,
    key: `${r.key_prefix}-${r.issue_number}`,
    summary: r.summary,
    description: r.description ?? '',
    issueType: (r.issue_type as IssueType) ?? 'task',
    priority: (r.priority as IssuePriority) ?? 'medium',
    status: (r.status as IssueStatus) ?? 'todo',
    assigneeId: r.assignee_id,
    assignee:
      r.assignee_id && r.assignee_username
        ? {
            id: r.assignee_id,
            username: r.assignee_username,
            displayName: r.assignee_display_name ?? null,
          }
        : null,
    reporterId: r.reporter_id,
    position: r.position,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const issueSelect = `
  SELECT i.*, w.key_prefix,
    u.username AS assignee_username, u.display_name AS assignee_display_name
  FROM issues i
  JOIN workspaces w ON w.id = i.workspace_id
  LEFT JOIN users u ON u.id = i.assignee_id
`;

export class IssueRepository {
  async listByWorkspace(workspaceId: string): Promise<Issue[]> {
    const { rows } = await pool.query<IssueRow>(
      `${issueSelect} WHERE i.workspace_id = $1
       ORDER BY i.status, i.position ASC, i.issue_number ASC`,
      [workspaceId]
    );
    return rows.map(rowToIssue);
  }

  async findById(issueId: string): Promise<Issue | null> {
    const { rows } = await pool.query<IssueRow>(`${issueSelect} WHERE i.id = $1`, [issueId]);
    return rows[0] ? rowToIssue(rows[0]) : null;
  }

  async nextIssueNumber(workspaceId: string): Promise<number> {
    const { rows } = await pool.query<{ max: string | null }>(
      'SELECT MAX(issue_number)::text AS max FROM issues WHERE workspace_id = $1',
      [workspaceId]
    );
    const max = rows[0]?.max ? parseInt(rows[0].max!, 10) : 0;
    return Number.isFinite(max) ? max + 1 : 1;
  }

  async insert(input: {
    workspaceId: string;
    issueNumber: number;
    summary: string;
    description?: string;
    issueType?: IssueType;
    priority?: IssuePriority;
    status?: IssueStatus;
    assigneeId?: string | null;
    reporterId: string;
    position?: number;
  }): Promise<Issue> {
    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO issues (
        workspace_id, issue_number, summary, description,
        issue_type, priority, status, assignee_id, reporter_id, position
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id`,
      [
        input.workspaceId,
        input.issueNumber,
        input.summary,
        input.description ?? '',
        input.issueType ?? 'task',
        input.priority ?? 'medium',
        input.status ?? 'todo',
        input.assigneeId ?? null,
        input.reporterId,
        input.position ?? 0,
      ]
    );
    const issue = await this.findById(rows[0].id);
    if (!issue) throw new Error('Không đọc lại được issue sau khi tạo');
    return issue;
  }

  async updatePatch(
    issueId: string,
    patch: Partial<{
      summary: string;
      description: string;
      issueType: IssueType;
      priority: IssuePriority;
      status: IssueStatus;
      assigneeId: string | null;
      position: number;
    }>
  ): Promise<Issue | null> {
    const current = await this.findById(issueId);
    if (!current) return null;
    const next = {
      summary: patch.summary ?? current.summary,
      description: patch.description ?? current.description,
      issue_type: patch.issueType ?? current.issueType,
      priority: patch.priority ?? current.priority,
      status: patch.status ?? current.status,
      assignee_id: patch.assigneeId !== undefined ? patch.assigneeId : current.assigneeId,
      position: patch.position ?? current.position,
    };
    await pool.query(
      `UPDATE issues SET
        summary = $2, description = $3, issue_type = $4,
        priority = $5, status = $6, assignee_id = $7, position = $8
       WHERE id = $1`,
      [
        issueId,
        next.summary,
        next.description,
        next.issue_type,
        next.priority,
        next.status,
        next.assignee_id,
        next.position,
      ]
    );
    return this.findById(issueId);
  }

  async updatePositions(
    workspaceId: string,
    rows: Array<{ id: string; status: IssueStatus; position: number }>
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const row of rows) {
        await client.query(
          'UPDATE issues SET status = $2, position = $3 WHERE id = $1 AND workspace_id = $4',
          [row.id, row.status, row.position, workspaceId]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async delete(issueId: string): Promise<boolean> {
    const r = await pool.query('DELETE FROM issues WHERE id = $1', [issueId]);
    return (r.rowCount ?? 0) > 0;
  }

  /** Max position within status column + 1 (for new card at end) */
  async nextPosition(workspaceId: string, status: IssueStatus): Promise<number> {
    const { rows } = await pool.query<{ max: string | null }>(
      `SELECT MAX(position)::text AS max FROM issues WHERE workspace_id = $1 AND status = $2`,
      [workspaceId, status]
    );
    const max = rows[0]?.max ? parseInt(rows[0].max!, 10) : -1;
    return Number.isFinite(max) ? max + 1 : 0;
  }
}
