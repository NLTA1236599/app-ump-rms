import { pool } from '../../config/database.js';
import { resolveSupervisorUserId } from '../research-projects/projectContactFields.js';
import type { ReminderRecipient } from './reminder.types.js';
import {
  listVerifiedSpecialists,
  specialistsForDepartment,
} from './specialistByUnit.js';

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
      department: string | null;
      supervisor_id: string | null;
    }>(
      `SELECT
         COALESCE(NULLIF(rp.data->>'title', ''), 'Đề tài không tên') AS title,
         COALESCE(NULLIF(rp.data->>'leadAuthor', ''), 'Chủ nhiệm đề tài') AS leader_name,
         COALESCE(
           NULLIF(rp.data->>'principalEmail', ''),
           NULLIF(rp.data#>>'{leaderDetails,0,email}', ''),
           (
             SELECT ${USER_EMAIL_SQL}
             FROM users u
             WHERE u.display_name = rp.data->>'leadAuthor'
             LIMIT 1
           )
         ) AS leader_email,
         NULLIF(rp.data->>'department', '') AS department,
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

    // Primary specialist recipients: verified specialist accounts whose allowed_units
    // cover this project's department. Email = admin "Quản lý người dùng" Email column.
    const unitSpecialists = specialistsForDepartment(
      await listVerifiedSpecialists(),
      project.department,
    );
    for (const specialist of unitSpecialists) {
      add(specialist.email, specialist.name, 'SPECIALIST');
    }

    // Also include the per-project Chuyên viên QL if assigned.
    const { rows: linked } = await pool.query<{ email: string; name: string }>(
      `SELECT
         ${USER_EMAIL_SQL} AS email,
         COALESCE(NULLIF(u.display_name, ''), u.username) AS name
       FROM project_specialists ps
       JOIN users u ON u.id = ps.user_id
       WHERE ps.project_id = $1`,
      [projectId],
    );

    for (const specialist of linked) {
      add(specialist.email, specialist.name, 'SPECIALIST');
    }

    if (linked.length === 0 && project.supervisor_id) {
      const supervisorId = await resolveSupervisorUserId(project.supervisor_id);
      if (supervisorId) {
        const { rows: supervisorRows } = await pool.query<{ email: string; name: string }>(
          `SELECT
             ${USER_EMAIL_SQL} AS email,
             COALESCE(NULLIF(u.display_name, ''), u.username) AS name
           FROM users u
           WHERE u.id = $1`,
          [supervisorId],
        );
        const supervisor = supervisorRows[0];
        if (supervisor) add(supervisor.email, supervisor.name, 'SPECIALIST');
      }
    }

    return recipients;
  }
}
