import { useEffect } from 'react';
import { useAuthContext } from './contexts/AuthContext.js';
import Login from './components/features/auth/Login.js';
import { TrackerBoard } from './components/features/board/TrackerBoard.js';
import { isSubmitterPortalRole, redirectToSubmitterPortal } from './utils/submitterPortalRedirect.js';

export default function App() {
  const { user, isLoading, logout } = useAuthContext();

  useEffect(() => {
    if (isLoading || !user || !isSubmitterPortalRole(user.role)) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    localStorage.removeItem('auth_token');
    redirectToSubmitterPortal(token, user);
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
