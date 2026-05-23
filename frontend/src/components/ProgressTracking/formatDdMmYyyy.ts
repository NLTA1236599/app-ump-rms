/**
 * Parse / format `dd/mm/yyyy` for form fields (canonical display for task dates per spec §8).
 * Avoids relying on `<input type="date">` locale quirks without adding a picker dependency.
 */

const RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function isValidDdMmYyyy(raw: string): boolean {
  const m = RE.exec(raw.trim());
  if (!m) return false;
  const d = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const y = Number(m[3]);
  const dt = new Date(y, mo, d);
  return dt.getFullYear() === y && dt.getMonth() === mo && dt.getDate() === d;
}

export function normalizeDdMmYyyy(raw: string): string {
  const m = RE.exec(raw.trim());
  return m ? `${m[1]}/${m[2]}/${m[3]}` : raw.trim();
}
