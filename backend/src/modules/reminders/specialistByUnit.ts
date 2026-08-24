import { pool } from '../../config/database.js';
import {
  expandAllowedDepartments,
  projectMatchesAllowedUnits,
} from '../research-projects/departmentAccess.js';

export type SpecialistAccount = {
  email: string;
  name: string;
  allowedUnits: string[];
};

/** Same mapping as admin "Quản lý người dùng" Email column. */
export function accountEmailFromUsername(username: string): string {
  const value = username.trim();
  if (!value) return '';
  return value.includes('@') ? value : `${value}@ump.edu.vn`;
}

/**
 * Empty allowed_units = every department (same as topic access in fe0-admin).
 * Otherwise the project's `department` must overlap the specialist's units.
 */
export function specialistCoversDepartment(
  allowedUnits: string[],
  department: unknown,
): boolean {
  if (allowedUnits.length === 0) return true;
  return projectMatchesAllowedUnits(
    department,
    new Set(expandAllowedDepartments(allowedUnits)),
  );
}

export async function listVerifiedSpecialists(): Promise<SpecialistAccount[]> {
  const { rows } = await pool.query<{
    username: string;
    display_name: string | null;
    allowed_units: string[] | null;
  }>(
    `SELECT username, display_name, COALESCE(allowed_units, '{}') AS allowed_units
     FROM users
     WHERE lower(role) = 'specialist'
       AND email_verified IS TRUE`,
  );

  return rows
    .map((row) => ({
      email: accountEmailFromUsername(row.username).toLowerCase(),
      name: (row.display_name ?? '').trim() || row.username,
      allowedUnits: Array.isArray(row.allowed_units) ? row.allowed_units : [],
    }))
    .filter((row) => row.email.includes('@'));
}

export function specialistsForDepartment(
  specialists: SpecialistAccount[],
  department: unknown,
): Array<{ email: string; name: string }> {
  return specialists
    .filter((specialist) => specialistCoversDepartment(specialist.allowedUnits, department))
    .map(({ email, name }) => ({ email, name }));
}

export function mergeSpecialistContacts(
  ...lists: Array<Array<{ email: string; name: string }>>
): Array<{ email: string; name: string }> {
  const seen = new Set<string>();
  const merged: Array<{ email: string; name: string }> = [];
  for (const list of lists) {
    for (const item of list) {
      const email = item.email.trim().toLowerCase();
      if (!email || seen.has(email)) continue;
      seen.add(email);
      merged.push({ email, name: item.name });
    }
  }
  return merged;
}
