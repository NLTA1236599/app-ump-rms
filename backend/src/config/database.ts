import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME ?? 'ump_rms_db',
  user: process.env.DB_USER ?? 'ump_rms_user',
  password: process.env.DB_PASSWORD ?? '',
  max: 20,
  idleTimeoutMillis: 30000,
});
