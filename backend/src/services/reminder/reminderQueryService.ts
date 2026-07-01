import {
  REMINDER_LOOKAHEAD,
  REMINDER_MATCH_WINDOW_SECONDS,
} from '../../config/reminderConfig.js';
import { pool } from '../../config/database.js';
import type { IReminderQuery, ProjectRecipient } from './IReminderQuery.js';

type ProjectRow = {
  id: string;
  title: string;
  deadline: string;
  leader_name: string;
  leader_email: string | null;
};

type SpecialistRow = {
  project_id: string;
  email: string;
  name: string;
};

const USER_EMAIL_SQL = `CASE
  WHEN position('@' in u.username) > 0 THEN u.username
  ELSE u.username || '@ump.edu.vn'
END`;

type DateField = 'reviewReportingDate' | 'extensionDate';

/**
 * Maps guide columns to research_projects JSONB fields:
 * - report_deadline        → reviewReportingDate
 * - acceptance_expiry_date → extensionDate
 *
 * Uses timestamptz matching so 1-minute / 3-minute test windows work.
 */
export class ReminderQueryService implements IReminderQuery {
  private async queryProjects(
    jsonDateField: DateField,
    interval: string,
  ): Promise<ProjectRecipient[]> {
    const { rows } = await pool.query<ProjectRow>(
      `SELECT
         rp.id,
         COALESCE(NULLIF(rp.data->>'title', ''), 'Đề tài không tên') AS title,
         jsonb_text_to_timestamptz(rp.data->>$1)::text AS deadline,
         COALESCE(NULLIF(rp.data->>'leadAuthor', ''), 'Chủ nhiệm đề tài') AS leader_name,
         COALESCE(
           NULLIF(rp.data->>'principalEmail', ''),
           (
             SELECT ${USER_EMAIL_SQL}
             FROM users u
             WHERE u.display_name = rp.data->>'leadAuthor'
             LIMIT 1
           )
         ) AS leader_email
       FROM research_projects rp
       WHERE jsonb_text_to_timestamptz(rp.data->>$1) IS NOT NULL
         AND jsonb_text_to_timestamptz(rp.data->>$1)
           BETWEEN (NOW() + $2::interval - make_interval(secs => $3))
               AND (NOW() + $2::interval + make_interval(secs => $3))`,
      [jsonDateField, interval, REMINDER_MATCH_WINDOW_SECONDS],
    );

    if (rows.length === 0) return [];

    const projectIds = rows.map((row) => row.id);
    const { rows: specialistRows } = await pool.query<SpecialistRow>(
      `SELECT
         ps.project_id,
         ${USER_EMAIL_SQL} AS email,
         COALESCE(NULLIF(u.display_name, ''), u.username) AS name
       FROM project_specialists ps
       JOIN users u ON ps.user_id = u.id
       WHERE ps.project_id = ANY($1::uuid[])`,
      [projectIds],
    );

    const specialistMap = new Map<string, Array<{ email: string; name: string }>>();
    for (const specialist of specialistRows) {
      const list = specialistMap.get(specialist.project_id) ?? [];
      list.push({ email: specialist.email, name: specialist.name });
      specialistMap.set(specialist.project_id, list);
    }

    const recipients: ProjectRecipient[] = [];

    for (const row of rows) {
      if (!row.leader_email) continue;

      recipients.push({
        projectId: row.id,
        projectTitle: row.title,
        deadlineDate: new Date(row.deadline),
        leader: {
          email: row.leader_email,
          name: row.leader_name,
        },
        specialists: specialistMap.get(row.id) ?? [],
      });
    }

    return recipients;
  }

  getProjectsWithReportDeadlineIn1Month() {
    return this.queryProjects('reviewReportingDate', REMINDER_LOOKAHEAD.report);
  }

  getProjectsWithAcceptanceExpiryIn3Months() {
    return this.queryProjects('extensionDate', REMINDER_LOOKAHEAD.acceptanceLong);
  }

  getProjectsWithAcceptanceExpiryIn1Month() {
    return this.queryProjects('extensionDate', REMINDER_LOOKAHEAD.acceptanceShort);
  }
}
