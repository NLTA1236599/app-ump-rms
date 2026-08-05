/**
 * Canonical đơn vị labels ↔ short codes found in imported Excel `department` values.
 * When a user is allowed a canonical unit, matching aliases also pass the filter.
 */
const DEPARTMENT_ALIASES: Record<string, string[]> = {
  'trung tam y sinh hoc phan tu': ['tt yshpt'],
  'trung tam kcclxnyh': ['tt kccl xnyh', 'tt kcclxnyh'],
  'trung tam giao duc y hoc': ['tt gdyh'],
  'truong duoc': ['duoc'],
  'truong y': ['y'],
  'truong dieu duong – ky thuat y hoc': ['truong dieu duong - ky thuat y hoc'],
  'phong dam bao clgd & kt': ['phong dam bao clgd va kt'],
};

/** Normalize for accent-insensitive, punctuation-tolerant department matching. */
export function normalizeDepartment(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Expand selected units with known import aliases for filtering. */
export function expandAllowedDepartments(units: string[]): string[] {
  const expanded = new Set<string>();

  for (const unit of units) {
    const trimmed = unit.trim();
    if (!trimmed) continue;

    const key = normalizeDepartment(trimmed);
    expanded.add(key);

    for (const alias of DEPARTMENT_ALIASES[key] ?? []) {
      expanded.add(normalizeDepartment(alias));
    }
  }

  return [...expanded];
}

/** True when project.department overlaps any allowed unit (semicolon-separated). */
export function projectMatchesAllowedUnits(
  department: unknown,
  allowedNormalized: Set<string>,
): boolean {
  if (allowedNormalized.size === 0) return true;
  const raw = typeof department === 'string' ? department : '';
  if (!raw.trim()) return false;

  return raw
    .split(';')
    .map((part) => normalizeDepartment(part))
    .filter(Boolean)
    .some((part) => allowedNormalized.has(part));
}
