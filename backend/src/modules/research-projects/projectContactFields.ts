import { pool } from '../../config/database.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function primaryLeaderEmailFromData(data: Record<string, unknown>): string {
  const direct = String(data.principalEmail ?? '').trim();
  if (direct) return direct;

  const details = data.leaderDetails;
  if (!Array.isArray(details)) return '';
  const first = details[0];
  if (!isRecord(first)) return '';
  return String(first.email ?? '').trim();
}

export async function resolveSupervisorUserId(raw: string): Promise<string | null> {
  const value = raw.trim();
  if (!value) return null;

  if (UUID_RE.test(value)) {
    const { rowCount } = await pool.query(`SELECT 1 FROM users WHERE id = $1`, [value]);
    return rowCount ? value : null;
  }

  const email = value.includes('@') ? value.toLowerCase() : `${value.toLowerCase()}@ump.edu.vn`;
  const local = email.slice(0, email.indexOf('@'));
  const { rows } = await pool.query<{ id: string }>(
    `SELECT id::text AS id
     FROM users
     WHERE lower(username) IN ($1, $2, $3)
     LIMIT 1`,
    [value.toLowerCase(), email, local],
  );
  return rows[0]?.id ?? null;
}

/** Fill principalEmail from leaderDetails and resolve supervisor email → user id. */
export async function normalizeProjectContactFields(
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const next = { ...data };
  const leaderEmail = primaryLeaderEmailFromData(next);
  if (leaderEmail && EMAIL_RE.test(leaderEmail)) {
    next.principalEmail = leaderEmail;
  }

  const supervisorRaw = String(next.supervisorId ?? '').trim();
  if (supervisorRaw) {
    const resolved = await resolveSupervisorUserId(supervisorRaw);
    if (resolved) next.supervisorId = resolved;
  }

  return next;
}
