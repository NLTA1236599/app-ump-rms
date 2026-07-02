import type { User } from '../types/index.js';

/** Session role value for "Người nộp đề tài" on the main login screen. */
export const SUBMITTER_SESSION_ROLE = 'user';

export const SUBMITTER_PORTAL_URL =
  import.meta.env.VITE_SUBMITTER_PORTAL_URL ?? 'http://localhost:5175';

export function isSubmitterPortalRole(role: string): boolean {
  return role === SUBMITTER_SESSION_ROLE || role === 'submitter';
}

export function shouldOpenSubmitterPortal(
  userRole: string,
  sessionRole?: string,
): boolean {
  if (sessionRole) return isSubmitterPortalRole(sessionRole);
  return isSubmitterPortalRole(userRole);
}

export function redirectToSubmitterPortal(token: string, user: User): void {
  const payload = encodeURIComponent(JSON.stringify({ ...user, token }));
  window.location.assign(`${SUBMITTER_PORTAL_URL}/de-tai?payload=${payload}`);
}
