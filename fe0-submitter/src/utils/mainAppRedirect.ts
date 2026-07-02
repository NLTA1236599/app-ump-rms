export const MAIN_APP_URL = import.meta.env.VITE_MAIN_APP_URL ?? 'http://localhost:5173';

/** Query flag consumed by the main app (5173) to force the login screen. */
export const MAIN_APP_LOGOUT_QUERY = 'logout=1';

export function buildMainAppLoginUrl(): string {
  const base = MAIN_APP_URL.replace(/\/$/, '');
  return `${base}/?${MAIN_APP_LOGOUT_QUERY}`;
}

/** Full-page navigation to the main RMS login screen (port 5173). */
export function redirectToMainAppLogin(): void {
  window.location.replace(buildMainAppLoginUrl());
}
