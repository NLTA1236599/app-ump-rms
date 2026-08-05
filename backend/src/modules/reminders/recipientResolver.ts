import { pool } from '../../config/database.js';
import type { ReminderRecipient } from './reminder.types.js';

const USER_EMAIL_SQL = `CASE
  WHEN position('@' in u.username) > 0 THEN u.username
  ELSE u.username || '@ump.edu.vn'
END`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export class RecipientResolver {
  async resolve(projectId: string): Promise<ReminderRecipient[]> {
    const { rows } = await pool.query<{
      title: string;
      leader_name: string;
      leader_email: string | null;
      supervisor_id: string | null;
    }>(
      `SELECT
         COALESCE(NULLIF(rp.data->>'title', ''), 'Đề tài không tên') AS title,
         COALESCE(NULLIF(rp.data->>'leadAuthor', ''), 'Chủ nhiệm đề tài') AS leader_name,
         COALESCE(
           NULLIF(rp.data->>'principalEmail', ''),
           (
             SELECT ${USER_EMAIL_SQL}
             FROM users u
             WHERE u.display_name = rp.data->>'leadAuthor'
             LIMIT 1
           )
         ) AS leader_email,
         NULLIF(rp.data->>'supervisorId', '') AS supervisor_id
       FROM research_projects rp
       WHERE rp.id = $1`,
      [projectId],
    );

    const project = rows[0];
    if (!project) return [];

    const recipients: ReminderRecipient[] = [];
    const seen = new Set<string>();

    const add = (email: string | null | undefined, fullName: string, role: ReminderRecipient['role']) => {
      const normalized = (email ?? '').trim().toLowerCase();
      if (!normalized || !isValidEmail(normalized) || seen.has(normalized)) return;
      seen.add(normalized);
      recipients.push({ email: normalized, fullName, role });
    };

    add(project.leader_email, project.leader_name, 'LEADER');

    // Prefer join table; fallback to supervisorId on project JSON.
    const { rows: specialists } = await pool.query<{ email: string; name: string }>(
      `SELECT
         ${USER_EMAIL_SQL} AS email,
         COALESCE(NULLIF(u.display_name, ''), u.username) AS name
       FROM project_specialists ps
       JOIN users u ON u.id = ps.user_id
       WHERE ps.project_id = $1`,
      [projectId],
    );

    for (const specialist of specialists) {
      add(specialist.email, specialist.name, 'SPECIALIST');
    }

    if (specialists.length === 0 && project.supervisor_id) {
      const { rows: supervisorRows } = await pool.query<{ email: string; name: string }>(
        `SELECT
           ${USER_EMAIL_SQL} AS email,
           COALESCE(NULLIF(u.display_name, ''), u.username) AS name
         FROM users u
         WHERE u.id = $1`,
        [project.supervisor_id],
      );
      const supervisor = supervisorRows[0];
      if (supervisor) add(supervisor.email, supervisor.name, 'SPECIALIST');
    }

    return recipients;
  }
}
