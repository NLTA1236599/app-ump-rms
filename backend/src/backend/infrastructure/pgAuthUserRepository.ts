import type { Pool } from 'pg';
import type { User } from '../../types/index.js';
import type { AuthUserRow, IAuthUserRepository } from '../contracts/authUserRepository.js';

function rowToUser(r: { id: unknown; username: unknown; role: unknown; display_name: unknown }): User {
  return {
    id: r.id as string,
    username: r.username as string,
    role: r.role as string,
    displayName: r.display_name as string | null,
  };
}

/** PostgreSQL implementation of auth persistence (guide §3 D — infra detail behind interface). */
export class PgAuthUserRepository implements IAuthUserRepository {
  constructor(private readonly pool: Pool) {}

  async insertUser(input: {
    username: string;
    passwordHash: string;
    role: string;
    displayName: string | null;
  }): Promise<User> {
    const { rows } = await this.pool.query(
      `INSERT INTO users (username, password, role, display_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, role, display_name`,
      [input.username, input.passwordHash, input.role, input.displayName]
    );
    return rowToUser(rows[0]);
  }

  async findByUsername(username: string): Promise<AuthUserRow | null> {
    const { rows } = await this.pool.query(
      'SELECT id, username, password, role, display_name FROM users WHERE username = $1',
      [username]
    );
    const r = rows[0];
    if (!r) return null;
    return {
      id: r.id as string,
      username: r.username as string,
      password: r.password as string,
      role: r.role as string,
      display_name: r.display_name as string | null,
    };
  }

  async findProfileById(userId: string): Promise<User | null> {
    const { rows } = await this.pool.query(
      'SELECT id, username, role, display_name FROM users WHERE id = $1',
      [userId]
    );
    const r = rows[0];
    if (!r) return null;
    return rowToUser(r);
  }
}
