/**
 * Map UI email field to API username.
 * New accounts store the full normalized email; legacy seed accounts may still be local-part only
 * (backend login falls back to local-part lookup).
 */
export function loginIdentifierToUsername(identifier: string): string {
  return identifier.trim().toLowerCase();
}
