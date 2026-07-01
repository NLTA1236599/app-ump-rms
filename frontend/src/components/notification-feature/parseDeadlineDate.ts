import { formatDate } from '../DataTable/formatDate.js';

/** Parse project date values (ISO, Excel serial, dd/mm/yyyy) into a local Date. */
export function parseDeadlineDate(value: string | number | null | undefined): Date | null {
  if (value == null || value === '') return null;

  const formatted = formatDate(value);
  if (!formatted) return null;

  const match = formatted.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function daysUntilDeadline(deadline: Date, now = new Date()): number {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffMs = startOfDay(deadline).getTime() - startOfDay(now).getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
