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
      staffId: string | null;
      phone: string | null;
      academicRank: string | null;
      workUnit: string | null;
      jobTitle: string | null;
      requestedRoles: string[];
    },
    client?: PoolClient
  ): Promise<User> {
    const db: Queryable = client ?? this.pool;
    const { rows } = await db.query(
      `INSERT INTO users (
         username, password, role, display_name, email_verified,
         staff_id, phone, academic_rank, work_unit, job_title, requested_roles
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::text[])
       RETURNING id, username, role, display_name`,
      [
        input.username,
        input.passwordHash,
        input.role,
        input.displayName,
        input.emailVerified,
        input.staffId,
        input.phone,
        input.academicRank,
        input.workUnit,
        input.jobTitle,
        input.requestedRoles,
      ]
    );
    return rowToUser(rows[0]);
  }

  async findByUsername(username: string): Promise<AuthUserRow | null> {
    const { rows } = await this.pool.query(
      `SELECT id, username, password, role, display_name, email_verified,
              COALESCE(failed_login_attempts, 0) AS failed_login_attempts,
              locked_until
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
      failed_login_attempts: Number(r.failed_login_attempts ?? 0),
      locked_until: r.locked_until ? new Date(r.locked_until as string) : null,
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

  async recordFailedLogin(userId: string, maxFailures: number, lockoutMinutes: number): Promise<void> {
    await this.pool.query(
      `UPDATE users
       SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
           locked_until = CASE
             WHEN COALESCE(failed_login_attempts, 0) + 1 >= $2
             THEN NOW() + ($3::int * INTERVAL '1 minute')
             ELSE locked_until
           END
       WHERE id = $1`,
      [userId, maxFailures, lockoutMinutes]
    );
  }

  async resetFailedLogin(userId: string): Promise<void> {
    await this.pool.query(
      `UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1`,
      [userId]
    );
  }
}
