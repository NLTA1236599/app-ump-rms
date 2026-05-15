import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/database.js';
import type { User } from '../../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production';
const SALT_ROUNDS = 12;

export class AuthService {
  async register(username: string, password: string, role: string, displayName?: string): Promise<User> {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await pool.query(
      `INSERT INTO users (username, password, role, display_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, role, display_name`,
      [username, hash, role, displayName ?? username]
    );
    const r = rows[0];
    return {
      id: r.id as string,
      username: r.username as string,
      role: r.role as string,
      displayName: r.display_name as string | null,
    };
  }

  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const row = rows[0];
    if (!row) {
      const err = new Error('Tài khoản không tồn tại');
      (err as Error & { status?: number }).status = 401;
      throw err;
    }
    const valid = await bcrypt.compare(password, row.password as string);
    if (!valid) {
      const err = new Error('Mật khẩu không đúng');
      (err as Error & { status?: number }).status = 401;
      throw err;
    }
    const user: User = {
      id: row.id as string,
      username: row.username as string,
      role: row.role as string,
      displayName: row.display_name as string | null,
    };
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
      expiresIn: '8h',
    });
    return { token, user };
  }

  async getProfile(userId: string): Promise<User | null> {
    const { rows } = await pool.query(
      'SELECT id, username, role, display_name FROM users WHERE id = $1',
      [userId]
    );
    const r = rows[0];
    if (!r) return null;
    return {
      id: r.id as string,
      username: r.username as string,
      role: r.role as string,
      displayName: r.display_name as string | null,
    };
  }
}
