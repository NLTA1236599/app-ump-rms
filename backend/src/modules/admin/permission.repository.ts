import { pool } from '../../config/database.js';

export type PermissionRow = {
  feature: string;
  allowed_roles: string[];
};

export class PermissionRepository {
  async findAll(): Promise<PermissionRow[]> {
    const { rows } = await pool.query<PermissionRow>(
      'SELECT feature, allowed_roles FROM feature_permissions ORDER BY feature',
    );
    return rows;
  }

  async upsert(feature: string, allowedRoles: string[]): Promise<PermissionRow> {
    const { rows } = await pool.query<PermissionRow>(
      `INSERT INTO feature_permissions (feature, allowed_roles)
       VALUES ($1, $2)
       ON CONFLICT (feature) DO UPDATE SET
         allowed_roles = EXCLUDED.allowed_roles,
         updated_at = NOW()
       RETURNING feature, allowed_roles`,
      [feature, allowedRoles],
    );
    return rows[0];
  }
}
