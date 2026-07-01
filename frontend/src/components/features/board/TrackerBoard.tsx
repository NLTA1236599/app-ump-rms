import { useCallback, useState } from 'react';
import {
  DashboardOverview,
  DEFAULT_HEADER_NAV_TAB,
  MainLayout,
  SiteHeader,
  type HeaderNavTabId,
} from '../../layout/AppChrome.js';
import {
  NotificationProvider,
  NotificationsPage,
} from '../../notification-feature/index.js';
import { ProjectManagerDashboard } from '../../projectManager/index.js';

function PlaceholderPanel({ label }: { label: string }) {
  return (
    <div className="rounded-[14px] border border-chrome-divider bg-chrome-surface p-12 text-center text-chrome-text-muted shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      Nội dung cho mục &ldquo;{label}&rdquo; đang được xây dựng.
    </div>
  );
}

export function TrackerBoard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<HeaderNavTabId | null>(DEFAULT_HEADER_NAV_TAB);
  const [isHomeActive, setIsHomeActive] = useState(false);
  const [showNotificationsPage, setShowNotificationsPage] = useState(false);
  const [pendingViewProjectId, setPendingViewProjectId] = useState<string | null>(null);

  const handleHomeClick = () => {
    setIsHomeActive(true);
    setActiveTab(null);
    setShowNotificationsPage(false);
  };

  const handleTabChange = (tabId: HeaderNavTabId) => {
    setIsHomeActive(false);
    setActiveTab(tabId);
    setShowNotificationsPage(false);
  };

  const handleViewProject = useCallback((projectId: string) => {
    setShowNotificationsPage(false);
    setIsHomeActive(false);
    setActiveTab('de-tai-khcn');
    setPendingViewProjectId(projectId);
  }, []);

  const handleShowAllNotifications = useCallback(() => {
    setIsHomeActive(false);
    setActiveTab(null);
    setShowNotificationsPage(true);
  }, []);

  const handlePendingViewConsumed = useCallback(() => {
    setPendingViewProjectId(null);
  }, []);

  const content = (() => {
    if (showNotificationsPage) {
      return (
        <NotificationsPage onBack={() => setShowNotificationsPage(false)} />
      );
    }

    if (isHomeActive) {
      return <DashboardOverview onFeaturedModuleClick={() => handleTabChange('de-tai-khcn')} />;
    }

    switch (activeTab) {
      case 'de-tai-khcn':
        return (
          <ProjectManagerDashboard
            initialViewProjectId={pendingViewProjectId}
            onInitialViewConsumed={handlePendingViewConsumed}
          />
        );
      case 'thong-ke-so-lieu':
        return <PlaceholderPanel label="Thống kê số liệu" />;
      case 'sang-kien':
        return <PlaceholderPanel label="Sáng kiến" />;
      case 'ho-so-y-duc':
        return <PlaceholderPanel label="Hồ sơ Y đức" />;
      case 'bai-bao-quoc-te':
        return <PlaceholderPanel label="Bài báo quốc tế" />;
      case 'gio-nckh':
        return <PlaceholderPanel label="Giờ NCKH" />;
      case 'hoi-nghi-hoi-thao':
        return <PlaceholderPanel label="Hội nghị - Hội thảo" />;
      case 'chuyen-giao-cong-nghe':
        return <PlaceholderPanel label="Chuyển giao công nghệ" />;
      default:
        return <ProjectManagerDashboard />;
    }
  })();

  return (
    <NotificationProvider
      onViewProject={handleViewProject}
      onShowAllNotifications={handleShowAllNotifications}
    >
      <MainLayout
        header={
          <SiteHeader
            activeTab={activeTab}
            isHomeActive={isHomeActive}
            onHomeClick={handleHomeClick}
            onTabChange={handleTabChange}
            onLogout={onLogout}
          />
        }
      >
        <div
          className={[
            'flex min-h-0 flex-1 flex-col overflow-y-auto bg-white',
            activeTab === 'de-tai-khcn' && !isHomeActive && !showNotificationsPage
              ? ''
              : 'gap-3 p-4 md:p-6',
          ].join(' ')}
        >
          {content}
        </div>
      </MainLayout>
    </NotificationProvider>
  );
}
