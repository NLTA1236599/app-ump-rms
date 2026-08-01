import type { Pool, PoolClient } from 'pg';
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

type Queryable = Pool | PoolClient;

/** PostgreSQL implementation of auth persistence (guide §3 D — infra detail behind interface). */
export class PgAuthUserRepository implements IAuthUserRepository {
  constructor(private readonly pool: Pool) {}

  async insertUser(
    input: {
      username: string;
      passwordHash: string;
      role: string;
      displayName: string | null;
      emailVerified: boolean;
    },
    client?: PoolClient
  ): Promise<User> {
    const db: Queryable = client ?? this.pool;
    const { rows } = await db.query(
      `INSERT INTO users (username, password, role, display_name, email_verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, role, display_name`,
      [input.username, input.passwordHash, input.role, input.displayName, input.emailVerified]
    );
    return rowToUser(rows[0]);
  }

  async findByUsername(username: string): Promise<AuthUserRow | null> {
    const { rows } = await this.pool.query(
      `SELECT id, username, password, role, display_name, email_verified
       FROM users WHERE username = $1`,
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
      email_verified: Boolean(r.email_verified),
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

  async markEmailVerified(userId: string, client?: PoolClient): Promise<void> {
    const db: Queryable = client ?? this.pool;
    await db.query(`UPDATE users SET email_verified = TRUE WHERE id = $1`, [userId]);
  }
}
