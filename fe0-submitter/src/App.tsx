import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute.js';
import { SubmitterLayout } from './components/Layout/SubmitterLayout.js';
import { FeatureComingSoonPage } from './pages/FeatureComingSoonPage.js';
import { LoginRoute } from './pages/LoginPage.js';
import { MyProjectsPage } from './pages/MyProjectsPage.js';
import { NotificationsPage } from './pages/NotificationsPage.js';
import { ProgressPage } from './pages/ProgressPage.js';
import { ProjectDetailPage } from './pages/ProjectDetailPage.js';
import { RegisterProjectPage } from './pages/RegisterProjectPage.js';
import { UnauthorizedPage } from './pages/UnauthorizedPage.js';

function AuthHandoffRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/de-tai${search}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/auth/handoff" element={<AuthHandoffRedirect />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <SubmitterLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/de-tai" replace />} />
          <Route path="de-tai" element={<MyProjectsPage />} />
          <Route path="de-tai/dang-ky" element={<RegisterProjectPage />} />
          <Route path="de-tai/tien-do" element={<ProgressPage />} />
          <Route path="de-tai/:id" element={<ProjectDetailPage />} />
          <Route path="thong-bao" element={<NotificationsPage />} />
          <Route path="sang-kien" element={<FeatureComingSoonPage />} />
          <Route path="ho-so-y-duc" element={<FeatureComingSoonPage />} />
          <Route path="bai-bao-quoc-te" element={<FeatureComingSoonPage />} />
          <Route path="gio-nckh" element={<FeatureComingSoonPage />} />
          <Route path="hoi-nghi-hoi-thao" element={<FeatureComingSoonPage />} />
          <Route path="thong-ke-so-lieu" element={<FeatureComingSoonPage />} />
          <Route path="chuyen-giao-cong-nghe" element={<FeatureComingSoonPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
