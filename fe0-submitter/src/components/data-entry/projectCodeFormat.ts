/** Canonical pattern: aaaa.bb.cc.ddd (4 + 2 + 2 + 3 digits). */
export const PROJECT_CODE_PATTERN = /^\d{4}\.\d{2}\.\d{2}\.\d{3}$/;

/** Strip non-digits and insert dot separators while typing. */
export function formatProjectCodeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  const g1 = digits.slice(0, 4);
  const g2 = digits.slice(4, 6);
  const g3 = digits.slice(6, 8);
  const g4 = digits.slice(8, 11);

  let out = g1;
  if (digits.length > 4) out += `.${g2}`;
  if (digits.length > 6) out += `.${g3}`;
  if (digits.length > 8) out += `.${g4}`;
  return out;
}

export function isCompleteProjectCode(value: string): boolean {
  return PROJECT_CODE_PATTERN.test(value.trim());
}
