import { Navigate } from 'react-router-dom';

import { useAuthStore } from '../store/authStore.js';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}
