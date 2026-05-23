import './env.js';
import { Pool } from 'pg';

function dbPassword(): string {
  const trimmed = process.env.DB_PASSWORD?.trim();
  if (trimmed) return trimmed;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'DB_PASSWORD must be set to a non-empty value in production. Copy backend/.env.example to backend/.env.'
    );
  }
  // Match docker-compose `POSTGRES_PASSWORD` default so local `npm run dev` works without a .env file.
  return 'change_me';
}

export const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME ?? 'ump_rms_db',
  user: process.env.DB_USER ?? 'ump_rms_user',
  password: dbPassword(),
  max: 20,
  idleTimeoutMillis: 30000,
});
