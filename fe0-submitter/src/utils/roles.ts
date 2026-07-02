/** Roles allowed to access the submitter portal (API may use `user` or `submitter`). */
export const SUBMITTER_PORTAL_ROLES = ['submitter', 'user'] as const;

export function isSubmitterPortalRole(role: string): boolean {
  return (SUBMITTER_PORTAL_ROLES as readonly string[]).includes(role);
}
