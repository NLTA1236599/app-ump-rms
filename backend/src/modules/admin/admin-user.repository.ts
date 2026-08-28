import { pool } from '../../config/database.js';

export type AdminUserRow = {
  id: string;
  username: string;
  display_name: string | null;
  role: string;
  allowed_units: string[];
  allowed_project_types: string[];
  email_verified: boolean;
  created_at: string;
  staff_id: string | null;
  phone: string | null;
  academic_rank: string | null;
  work_unit: string | null;
  job_title: string | null;
  requested_roles: string[];
};

export class AdminUserRepository {
  async findAll(): Promise<AdminUserRow[]> {
    const { rows } = await pool.query<AdminUserRow>(
      `SELECT id, username, display_name, role,
              COALESCE(allowed_units, '{}') AS allowed_units,
              COALESCE(allowed_project_types, '{}') AS allowed_project_types,
              email_verified,
              created_at,
              staff_id,
              phone,
              academic_rank,
              work_unit,
              job_title,
              COALESCE(requested_roles, '{}') AS requested_roles
       FROM users
       ORDER BY email_verified ASC, created_at DESC`,
    );
    return rows.map((row) => ({
      ...row,
      allowed_units: Array.isArray(row.allowed_units) ? row.allowed_units : [],
      allowed_project_types: Array.isArray(row.allowed_project_types) ? row.allowed_project_types : [],
      requested_roles: Array.isArray(row.requested_roles) ? row.requested_roles : [],
      email_verified: Boolean(row.email_verified),
    }));
  }

  async findAllowedUnitsById(id: string): Promise<{
    role: string;
    allowed_units: string[];
    allowed_project_types: string[];
  } | null> {
    const { rows } = await pool.query<{
      role: string;
      allowed_units: string[];
      allowed_project_types: string[];
    }>(
      `SELECT role,
              COALESCE(allowed_units, '{}') AS allowed_units,
              COALESCE(allowed_project_types, '{}') AS allowed_project_types
       FROM users WHERE id = $1`,
      [id],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      role: row.role,
      allowed_units: Array.isArray(row.allowed_units) ? row.allowed_units : [],
      allowed_project_types: Array.isArray(row.allowed_project_types) ? row.allowed_project_types : [],
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

  async updateAllowedProjectTypes(id: string, allowedProjectTypes: string[]): Promise<boolean> {
    const r = await pool.query(
      'UPDATE users SET allowed_project_types = $2::text[] WHERE id = $1',
      [id, allowedProjectTypes],
    );
    return (r.rowCount ?? 0) > 0;
  }

  async grantAccess(id: string): Promise<'granted' | 'already' | 'missing'> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query<{ email_verified: boolean }>(
        'SELECT email_verified FROM users WHERE id = $1 FOR UPDATE',
        [id],
      );
      if (!rows[0]) {
        await client.query('ROLLBACK');
        return 'missing';
      }
      if (rows[0].email_verified) {
        await client.query('COMMIT');
        return 'already';
      }

      await client.query('UPDATE users SET email_verified = TRUE WHERE id = $1', [id]);
      await client.query(
        `UPDATE registration_otp_codes
         SET used_at = NOW()
         WHERE user_id = $1 AND used_at IS NULL`,
        [id],
      );
      await client.query('COMMIT');
      return 'granted';
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
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
