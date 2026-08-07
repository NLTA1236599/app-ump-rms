import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute.js';
import { AdminLayout } from './components/Layout/AdminLayout.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { OperationHistoryPage } from './pages/OperationHistoryPage.js';
import { PermissionsPage } from './pages/PermissionsPage.js';
import { TopicPermissionsPage } from './pages/TopicPermissionsPage.js';
import { UnauthorizedPage } from './pages/UnauthorizedPage.js';
import { UsersPage } from './pages/UsersPage.js';

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

/** Docker build uses base=/admin/; opening :5174/ would leave Router unmatched. */
function ensureBasenamePath(): void {
  if (routerBasename === '/' || typeof window === 'undefined') return;
  const { pathname, search, hash } = window.location;
  if (pathname === routerBasename || pathname.startsWith(`${routerBasename}/`)) return;
  const suffix = pathname === '/' ? '/' : pathname;
  window.location.replace(`${routerBasename}${suffix}${search}${hash}`);
}

ensureBasenamePath();

export default function App() {
  return (
    <BrowserRouter basename={routerBasename === '/' ? undefined : routerBasename}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="permissions" element={<PermissionsPage />} />
          <Route path="topic-permissions" element={<TopicPermissionsPage />} />
          <Route path="operation-history" element={<OperationHistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
