import type { NextFunction, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import type { User } from '../../types/index.js';

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const { rows } = await pool.query(
      'SELECT id, username, role, display_name FROM users ORDER BY username ASC'
    );
    const users: User[] = rows.map((r) => ({
      id: r.id as string,
      username: r.username as string,
      role: r.role as string,
      displayName: r.display_name as string | null,
    }));
    res.json(users);
  } catch (e) {
    next(e);
  }
}
