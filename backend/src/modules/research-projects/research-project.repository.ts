import { pool } from '../../config/database.js';

export type ResearchProjectRow = {
  id: string;
  data: Record<string, unknown>;
  import_file_id: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export class ResearchProjectRepository {
  async findAll(): Promise<Record<string, unknown>[]> {
    const { rows } = await pool.query<ResearchProjectRow>(
      'SELECT * FROM research_projects ORDER BY created_at ASC',
    );
    return rows.map((row) => ({
      id: row.id,
      ...row.data,
      created_by: row.created_by,
    }));
  }

  async insertMany(
    projects: Record<string, unknown>[],
    userId: string,
    importFileId?: string | null,
  ): Promise<Record<string, unknown>[]> {
    if (projects.length === 0) return [];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const saved: Record<string, unknown>[] = [];

      for (const project of projects) {
        const id = String(project.id);
        const { id: _id, ...data } = project;
        const { rows } = await client.query<ResearchProjectRow>(
          `INSERT INTO research_projects (id, data, import_file_id, created_by, updated_by)
           VALUES ($1, $2::jsonb, $3, $4, $4)
           RETURNING *`,
          [id, JSON.stringify(data), importFileId ?? null, userId],
        );
        saved.push({ id: rows[0].id, ...rows[0].data });
      }

      await client.query('COMMIT');
      return saved;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async upsert(project: Record<string, unknown>, userId: string): Promise<Record<string, unknown> | null> {
    const id = String(project.id);
    const { id: _id, ...data } = project;
    const { rows } = await pool.query<ResearchProjectRow>(
      `INSERT INTO research_projects (id, data, created_by, updated_by)
       VALUES ($1, $2::jsonb, $3, $3)
       ON CONFLICT (id) DO UPDATE SET
         data = EXCLUDED.data,
         updated_by = EXCLUDED.updated_by,
         updated_at = NOW()
       RETURNING *`,
      [id, JSON.stringify(data), userId],
    );
    return rows[0] ? { id: rows[0].id, ...rows[0].data } : null;
  }

  async deleteById(id: string): Promise<boolean> {
    const r = await pool.query('DELETE FROM research_projects WHERE id = $1', [id]);
    return (r.rowCount ?? 0) > 0;
  }

  async deleteByIds(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const r = await pool.query('DELETE FROM research_projects WHERE id = ANY($1::uuid[])', [ids]);
    return r.rowCount ?? 0;
  }

  async deleteAll(): Promise<number> {
    const r = await pool.query('DELETE FROM research_projects');
    return r.rowCount ?? 0;
  }
}
