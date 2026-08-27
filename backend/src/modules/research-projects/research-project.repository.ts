import type { PoolClient } from 'pg';

import { pool } from '../../config/database.js';
import { applyComposedContractId } from './contractNumber.js';
import { applyComposedProjectCode } from './projectCode.js';

export type ResearchProjectRow = {
  id: string;
  data: Record<string, unknown>;
  import_file_id: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: ResearchProjectRow): Record<string, unknown> {
  // Prefer DB primary key over any `id` nested inside JSONB `data`.
  return {
    ...row.data,
    id: row.id,
    created_by: row.created_by,
  };
}

const NEXT_SEQUENCE_SQL = `
SELECT GREATEST(
  (SELECT last_number FROM project_year_sequences WHERE year = $1),
  COALESCE((
    SELECT MAX((data->>'registrationSequenceNumber')::int)
    FROM research_projects
    WHERE (data->>'registrationSequenceNumber') ~ '^[0-9]+$'
      AND (
        ((data->>'registrationSequenceYear') ~ '^[0-9]+$'
          AND (data->>'registrationSequenceYear')::int = $1)
        OR substring(COALESCE(data->>'reviewBatch', '') from '([0-9]{4})[[:space:]]*$')::int = $1
      )
  ), 0),
  COALESCE((
    SELECT COUNT(*)::int
    FROM research_projects
    WHERE substring(COALESCE(data->>'reviewBatch', '') from '([0-9]{4})[[:space:]]*$')::int = $1
  ), 0)
) + 1 AS next
`;

async function allocateNextOnClient(client: PoolClient, year: number): Promise<number> {
  await client.query(
    `INSERT INTO project_year_sequences (year, last_number)
     VALUES ($1, 0)
     ON CONFLICT (year) DO NOTHING`,
    [year],
  );
  await client.query(
    `SELECT last_number FROM project_year_sequences WHERE year = $1 FOR UPDATE`,
    [year],
  );

  const { rows } = await client.query<{ next: number }>(NEXT_SEQUENCE_SQL, [year]);
  const next = rows[0]?.next;
  if (!next || next < 1) {
    throw new Error('Không cấp được số thứ tự');
  }

  await client.query(
    `UPDATE project_year_sequences SET last_number = $2 WHERE year = $1`,
    [year, next],
  );
  return next;
}

export class ResearchProjectRepository {
  async findAll(): Promise<Record<string, unknown>[]> {
    const { rows } = await pool.query<ResearchProjectRow>(
      'SELECT * FROM research_projects ORDER BY created_at ASC',
    );
    return rows.map(mapRow);
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

  /**
   * Save a project. When `allocateYear` is set, the yearly sequence is assigned
   * in the same transaction as the write (first successful save wins).
   */
  async upsert(
    project: Record<string, unknown>,
    userId: string,
    allocateYear?: number | null,
  ): Promise<Record<string, unknown> | null> {
    const id = String(project.id);
    const { id: _id, ...incoming } = project;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existing = await client.query<ResearchProjectRow>(
        'SELECT * FROM research_projects WHERE id = $1 FOR UPDATE',
        [id],
      );
      const existingData = existing.rows[0]?.data ?? {};
      const data = { ...incoming };

      if (allocateYear) {
        const dbNumber = Number(existingData.registrationSequenceNumber);
        const dbYear = Number(existingData.registrationSequenceYear);
        if (Number.isInteger(dbNumber) && dbNumber > 0 && dbYear === allocateYear) {
          data.registrationSequenceNumber = dbNumber;
          data.registrationSequenceYear = allocateYear;
        } else {
          const sequenceNumber = await allocateNextOnClient(client, allocateYear);
          data.registrationSequenceNumber = sequenceNumber;
          data.registrationSequenceYear = allocateYear;
        }
      } else if (existing.rows[0]) {
        if (existingData.registrationSequenceNumber != null) {
          data.registrationSequenceNumber = existingData.registrationSequenceNumber;
        }
        if (existingData.registrationSequenceYear != null) {
          data.registrationSequenceYear = existingData.registrationSequenceYear;
        }
      } else {
        delete data.registrationSequenceNumber;
        delete data.registrationSequenceYear;
      }

      applyComposedContractId(data);
      applyComposedProjectCode(data);

      const { rows } = await client.query<ResearchProjectRow>(
        `INSERT INTO research_projects (id, data, created_by, updated_by)
         VALUES ($1, $2::jsonb, $3, $3)
         ON CONFLICT (id) DO UPDATE SET
           data = EXCLUDED.data,
           updated_by = EXCLUDED.updated_by,
           updated_at = NOW()
         RETURNING *`,
        [id, JSON.stringify(data), userId],
      );
      await client.query('COMMIT');
      return rows[0] ? { id: rows[0].id, ...rows[0].data } : null;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
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
