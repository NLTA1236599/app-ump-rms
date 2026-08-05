import { pool } from '../../config/database.js';

export type AdminUserRow = {
  id: string;
  username: string;
  display_name: string | null;
  role: string;
  allowed_units: string[];
  created_at: string;
};

export class AdminUserRepository {
  async findAll(): Promise<AdminUserRow[]> {
    const { rows } = await pool.query<AdminUserRow>(
      `SELECT id, username, display_name, role,
              COALESCE(allowed_units, '{}') AS allowed_units,
              created_at
       FROM users
       ORDER BY created_at DESC`,
    );
    return rows.map((row) => ({
      ...row,
      allowed_units: Array.isArray(row.allowed_units) ? row.allowed_units : [],
    }));
  }

  async findAllowedUnitsById(id: string): Promise<{ role: string; allowed_units: string[] } | null> {
    const { rows } = await pool.query<{ role: string; allowed_units: string[] }>(
      `SELECT role, COALESCE(allowed_units, '{}') AS allowed_units
       FROM users WHERE id = $1`,
      [id],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      role: row.role,
      allowed_units: Array.isArray(row.allowed_units) ? row.allowed_units : [],
    };
  }

  async updateRole(id: string, role: string): Promise<boolean> {
    const r = await pool.query('UPDATE users SET role = $2 WHERE id = $1', [id, role]);
    return (r.rowCount ?? 0) > 0;
  }

  async updateAllowedUnits(id: string, allowedUnits: string[]): Promise<boolean> {
    const r = await pool.query('UPDATE users SET allowed_units = $2::text[] WHERE id = $1', [
      id,
      allowedUnits,
    ]);
    return (r.rowCount ?? 0) > 0;
  }

  async deleteById(id: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM project_import_files WHERE uploaded_by = $1', [id]);
      await client.query('DELETE FROM issues WHERE reporter_id = $1', [id]);
      const r = await client.query('DELETE FROM users WHERE id = $1', [id]);
      await client.query('COMMIT');
      return (r.rowCount ?? 0) > 0;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
