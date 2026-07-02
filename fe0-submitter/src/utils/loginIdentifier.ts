/** Map UI email field to API username (e.g. nltanh@ump.edu.vn → nltanh). */
export function loginIdentifierToUsername(identifier: string): string {
  const trimmed = identifier.trim();
  const at = trimmed.indexOf('@');
  if (at > 0) return trimmed.slice(0, at).trim() || trimmed;
  return trimmed;
}

export function usernameToEmail(username: string): string {
  return username.includes('@') ? username : `${username}@ump.edu.vn`;
}
