import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute.js';
import { AdminLayout } from './components/Layout/AdminLayout.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { PermissionsPage } from './pages/PermissionsPage.js';
import { UnauthorizedPage } from './pages/UnauthorizedPage.js';
import { UsersPage } from './pages/UsersPage.js';

export default function App() {
  return (
    <BrowserRouter>
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
