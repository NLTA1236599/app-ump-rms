import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../store/authStore.js';
import { redirectToMainAppLogin } from '../utils/mainAppRedirect.js';

/** Submitter accounts sign in on the main RMS app (5173), not here. */
export function LoginPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/de-tai', { replace: true });
      return;
    }
    redirectToMainAppLogin();
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f6fb] text-sm text-slate-500">
      Đang chuyển đến trang đăng nhập…
    </div>
  );
}

/** Used by ProtectedRoute — sends unauthenticated users to main app login. */
export function LoginRedirect() {
  useEffect(() => {
    redirectToMainAppLogin();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f6fb] text-sm text-slate-500">
      Đang chuyển đến trang đăng nhập…
    </div>
  );
}

export function LoginRoute() {
  const user = useAuthStore((state) => state.user);
  if (user) return <Navigate to="/de-tai" replace />;
  return <LoginRedirect />;
}
