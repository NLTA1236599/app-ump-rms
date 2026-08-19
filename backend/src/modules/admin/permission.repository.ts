import { pool } from '../../config/database.js';
import { FEATURE_CATALOG, DEFAULT_FEATURE_ROLES, featureLabel, isCatalogFeature } from './featureCatalog.js';

export type PermissionRow = {
  feature: string;
  label: string;
  allowed_roles: string[];
};

export class PermissionRepository {
  async findAll(): Promise<PermissionRow[]> {
    const { rows } = await pool.query<{ feature: string; allowed_roles: string[] }>(
      'SELECT feature, allowed_roles FROM feature_permissions',
    );
    const byFeature = new Map(rows.map((row) => [row.feature, row.allowed_roles]));

    return FEATURE_CATALOG.map((item) => ({
      feature: item.feature,
      label: item.label,
      allowed_roles: byFeature.get(item.feature) ?? [...DEFAULT_FEATURE_ROLES],
    }));
  }

  async featuresForRole(role: string): Promise<string[]> {
    const normalized = role.trim().toLowerCase();
    const rows = await this.findAll();
    return rows
      .filter((row) => row.allowed_roles.some((allowed) => allowed.toLowerCase() === normalized))
      .map((row) => row.feature);
  }

  async upsert(feature: string, allowedRoles: string[]): Promise<PermissionRow> {
    if (!isCatalogFeature(feature)) {
      throw new Error(`Unknown feature: ${feature}`);
    }

    const { rows } = await pool.query<{ feature: string; allowed_roles: string[] }>(
      `INSERT INTO feature_permissions (feature, allowed_roles)
       VALUES ($1, $2)
       ON CONFLICT (feature) DO UPDATE SET
         allowed_roles = EXCLUDED.allowed_roles,
         updated_at = NOW()
       RETURNING feature, allowed_roles`,
      [feature, allowedRoles],
    );
    const row = rows[0];
    return {
      feature: row.feature,
      label: featureLabel(row.feature),
      allowed_roles: row.allowed_roles,
    };
  }
}
