/** Parses project dates — handles Excel serials, DD/MM/YYYY, and YYYY-MM-DD without TZ drift. */
export function parseDate(value: string | number | null | undefined): Date | null {
  if (value == null || value === '') return null;

  if (typeof value === 'number') {
    if (value > 20000 && value < 100000) {
      return new Date((value - 25569) * 86400 * 1000);
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const str = String(value).trim();

  const ddmmyyyy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const [, year, month, day] = iso;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (/^\d+(\.\d+)?$/.test(str)) {
    const serial = Number(str);
    if (serial > 20000 && serial < 100000) {
      return new Date((serial - 25569) * 86400 * 1000);
    }
  }

  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function toInputDate(value: string | number | null | undefined): string {
  const parsed = parseDate(value);
  if (!parsed) return '';
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function daysBetween(start: Date, end: Date): number {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
}
