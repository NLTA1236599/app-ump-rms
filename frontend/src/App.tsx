import { useAuthContext } from './contexts/AuthContext.js';
import Login from './components/features/auth/Login.js';
import { TrackerBoard } from './components/features/board/TrackerBoard.js';

export default function App() {
  const { user, isLoading, logout } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-chrome-surface text-chrome-text-muted">
        Loading…
      </div>
    );
  }

  if (!user) return <Login />;

  return <TrackerBoard onLogout={logout} />;
}
