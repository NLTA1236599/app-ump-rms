/** Map UI "email" field to API username (e.g. admin@ump.edu.vn → admin). */
export function loginIdentifierToUsername(identifier: string): string {
  const t = identifier.trim();
  const at = t.indexOf('@');
  if (at > 0) return t.slice(0, at).trim() || t;
  return t;
}
