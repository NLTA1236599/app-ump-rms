import { pool } from '../../config/database.js';
import { MILESTONE_FIELD_BY_CODE } from './reminder.config.js';

function parseDueDate(raw: unknown): string | null {
  if (raw == null) return null;
  const text = String(raw).trim();
  if (!text) return null;

  // YYYY-MM-DD or ISO datetime
  const day = text.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  return day;
}

export class MilestoneSyncService {
  /** Sync milestones + specialist link for one project from its JSONB data. */
  async syncProject(projectId: string, data: Record<string, unknown>): Promise<number> {
    const { rows: types } = await pool.query<{ id: number; code: string }>(
      `SELECT id, code FROM reminder_milestone_types WHERE is_active = TRUE`,
    );

    let upserted = 0;
    for (const type of types) {
      const field = MILESTONE_FIELD_BY_CODE[type.code];
      if (!field) continue;
      const dueDate = parseDueDate(data[field]);
      if (!dueDate) {
        // Cancel pending milestone if date removed
        await pool.query(
          `UPDATE project_milestones
           SET status = 'CANCELLED', updated_at = NOW()
           WHERE project_id = $1
             AND milestone_type_id = $2
             AND status = 'PENDING'`,
          [projectId, type.id],
        );
        continue;
      }

      await pool.query(
        `INSERT INTO project_milestones (project_id, milestone_type_id, due_date, status)
         VALUES ($1, $2, $3::date, 'PENDING')
         ON CONFLICT (project_id, milestone_type_id) DO UPDATE SET
           due_date = EXCLUDED.due_date,
           status = CASE
             WHEN project_milestones.status = 'DONE' THEN project_milestones.status
             ELSE 'PENDING'
           END,
           updated_at = NOW()`,
        [projectId, type.id, dueDate],
      );
      upserted += 1;
    }

    await this.syncSpecialist(projectId, data);
    return upserted;
  }

  async syncSpecialist(projectId: string, data: Record<string, unknown>): Promise<void> {
    const supervisorId = String(data.supervisorId ?? '').trim();
    await pool.query(`DELETE FROM project_specialists WHERE project_id = $1`, [projectId]);
    if (!supervisorId) return;

    const { rowCount } = await pool.query(`SELECT 1 FROM users WHERE id = $1`, [supervisorId]);
    if (!rowCount) return;

    await pool.query(
      `INSERT INTO project_specialists (project_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [projectId, supervisorId],
    );
  }

  /** Full resync from all research_projects (startup / migration helper). */
  async syncAll(): Promise<{ projects: number; milestones: number }> {
    const { rows } = await pool.query<{ id: string; data: Record<string, unknown> }>(
      `SELECT id, data FROM research_projects`,
    );

    let milestones = 0;
    for (const row of rows) {
      milestones += await this.syncProject(row.id, row.data ?? {});
    }
    return { projects: rows.length, milestones };
  }
}
