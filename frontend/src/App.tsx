import { useEffect } from 'react';
import { useAuthContext } from './contexts/AuthContext.js';
import Login from './components/features/auth/Login.js';
import { TrackerBoard } from './components/features/board/TrackerBoard.js';
import {
  isSubmitterPortalRole,
  redirectToSubmitterPortal,
  SUBMITTER_PORTAL_URL,
} from './utils/submitterPortalRedirect.js';

export default function App() {
  const { user, isLoading, logout } = useAuthContext();

  useEffect(() => {
    if (isLoading || !user || !isSubmitterPortalRole(user.role)) return;

    const token = localStorage.getItem('auth_token');
    if (token) {
      localStorage.removeItem('auth_token');
      redirectToSubmitterPortal(token, user);
      return;
    }

    // Token already handed off — open submitter portal (session lives in 5175 localStorage).
    window.location.replace(`${SUBMITTER_PORTAL_URL}/de-tai`);
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-chrome-surface text-chrome-text-muted">
        Loading…
      </div>
    );
  }

  if (!user) return <Login />;

  if (isSubmitterPortalRole(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-chrome-surface text-chrome-text-muted">
        Đang chuyển đến cổng người nộp đề tài…
      </div>
    );
  }

  return <TrackerBoard onLogout={logout} />;
}
