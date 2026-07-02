import { useAuthStore } from '../store/authStore.js';
import type { SubmitterSession } from '../types/index.js';
import { isSubmitterPortalRole } from '../utils/roles.js';

function parseSessionPayload(raw: string | null): SubmitterSession | null {
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as SubmitterSession;
    if (!session?.token || !session?.id || !session?.username || !session?.role) {
      return null;
    }
    if (!isSubmitterPortalRole(session.role)) return null;
    return session;
  } catch {
    return null;
  }
}

/** Apply session from URL before first render so protected routes never flash /login. */
export function bootstrapSubmitterSession(): void {
  if (useAuthStore.getState().user) return;

  const url = new URL(window.location.href);
  const rawPayload = url.searchParams.get('payload');
  const session = parseSessionPayload(rawPayload);
  if (!session) return;

  useAuthStore.getState().setUser(session);

  url.searchParams.delete('payload');
  const path =
    url.pathname === '/auth/handoff' || url.pathname === '/login' ? '/de-tai' : url.pathname;
  window.history.replaceState({}, '', `${path}${url.search}`);
}
