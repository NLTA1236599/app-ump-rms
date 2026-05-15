import { pool } from '../../config/database.js';
import type { Workspace, WorkspaceRow } from '../../types/index.js';

function toWorkspace(row: WorkspaceRow): Workspace {
  return {
    id: row.id,
    keyPrefix: row.key_prefix,
    name: row.name,
    description: row.description ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class WorkspaceRepository {
  async findAll(): Promise<Workspace[]> {
    const { rows } = await pool.query<WorkspaceRow>(
      'SELECT * FROM workspaces ORDER BY created_at DESC'
    );
    return rows.map(toWorkspace);
  }

  async findById(id: string): Promise<Workspace | null> {
    const { rows } = await pool.query<WorkspaceRow>('SELECT * FROM workspaces WHERE id = $1', [id]);
    return rows[0] ? toWorkspace(rows[0]) : null;
  }

  async findByKeyPrefix(keyPrefix: string): Promise<Workspace | null> {
    const { rows } = await pool.query<WorkspaceRow>(
      'SELECT * FROM workspaces WHERE key_prefix = $1',
      [keyPrefix.toUpperCase()]
    );
    return rows[0] ? toWorkspace(rows[0]) : null;
  }

  async insert(input: { keyPrefix: string; name: string; description?: string }): Promise<Workspace> {
    const { rows } = await pool.query<WorkspaceRow>(
      `INSERT INTO workspaces (key_prefix, name, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.keyPrefix.toUpperCase(), input.name, input.description ?? null]
    );
    return toWorkspace(rows[0]);
  }

  async update(
    id: string,
    patch: Partial<{ keyPrefix: string; name: string; description: string }>
  ): Promise<Workspace | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    const next = {
      keyPrefix: patch.keyPrefix ?? existing.keyPrefix,
      name: patch.name ?? existing.name,
      description: patch.description ?? existing.description,
    };
    const { rows } = await pool.query<WorkspaceRow>(
      `UPDATE workspaces SET key_prefix = $2, name = $3, description = $4 WHERE id = $1 RETURNING *`,
      [id, next.keyPrefix.toUpperCase(), next.name, next.description || null]
    );
    return rows[0] ? toWorkspace(rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const r = await pool.query('DELETE FROM workspaces WHERE id = $1', [id]);
    return (r.rowCount ?? 0) > 0;
  }
}
