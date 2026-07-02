import { useAuthStore } from '../store/authStore.js';
import { redirectToMainAppLogin } from '../utils/mainAppRedirect.js';

/** Clear submitter session and open the main app login screen on port 5173. */
export function performSubmitterLogout(): void {
  useAuthStore.getState().logout();
  redirectToMainAppLogin();
}
