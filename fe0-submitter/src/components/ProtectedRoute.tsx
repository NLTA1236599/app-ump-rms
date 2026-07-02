import { Navigate } from 'react-router-dom';

import { useAuthStore } from '../store/authStore.js';
import { LoginRedirect } from '../pages/LoginPage.js';
import { isSubmitterPortalRole } from '../utils/roles.js';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) return <LoginRedirect />;
  if (user.role === 'admin') return <Navigate to="/unauthorized" replace />;
  if (!isSubmitterPortalRole(user.role)) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}
