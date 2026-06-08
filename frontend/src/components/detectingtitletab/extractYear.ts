import { formatDate } from '../DataTable/formatDate.js';

/** Extracts a 4-digit year from project dates or acceptance year fields. */
export function extractYear(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;

  const raw = String(value).trim();
  if (/^\d{4}$/.test(raw)) return Number(raw);

  const formatted = formatDate(value);
  if (!formatted) return null;

  const match = formatted.match(/(\d{4})$/);
  return match ? Number(match[1]) : null;
}

export function getProjectYear(project: {
  startDate?: string | number | null;
  acceptanceYear?: string;
}): number | null {
  return extractYear(project.startDate) ?? extractYear(project.acceptanceYear);
}
