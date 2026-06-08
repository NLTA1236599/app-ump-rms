/** Canonical storage: `YYYY-MM-DD`; display: `dd/mm/yyyy` per DataEntryfinal-spec.md §13 */

const DD_MM_YYYY = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function isValidDdMmYyyy(raw: string): boolean {
  const m = DD_MM_YYYY.exec(raw.trim());
  if (!m) return false;
  const d = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const y = Number(m[3]);
  const dt = new Date(y, mo, d);
  return dt.getFullYear() === y && dt.getMonth() === mo && dt.getDate() === d;
}

export function ddMmYyyyToIso(validDdMmYyyy: string): string {
  const m = DD_MM_YYYY.exec(validDdMmYyyy.trim())!;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export function isoToDisplay(iso: string): string {
  if (!iso.trim()) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return '';
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** Progressive mask while typing — digits only, auto-inserts `/`. */
export function formatDateInputMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function parseNumberField(raw: string): number {
  const n = Number(String(raw).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}
