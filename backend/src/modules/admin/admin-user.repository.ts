import { pool } from '../../config/database.js';

export type AdminUserRow = {
  id: string;
  username: string;
  display_name: string | null;
  role: string;
  created_at: string;
};

export class AdminUserRepository {
  async findAll(): Promise<AdminUserRow[]> {
    const { rows } = await pool.query<AdminUserRow>(
      `SELECT id, username, display_name, role, created_at
       FROM users
       ORDER BY created_at DESC`,
    );
    return rows;
  }

  async updateRole(id: string, role: string): Promise<boolean> {
    const r = await pool.query('UPDATE users SET role = $2 WHERE id = $1', [id, role]);
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
