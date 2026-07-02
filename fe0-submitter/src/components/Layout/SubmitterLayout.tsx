import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { performSubmitterLogout } from '../../auth/performSubmitterLogout.js';
import { SiteHeader } from './header/SiteHeader.js';
import { DEFAULT_HEADER_NAV_TAB, type HeaderNavTabId } from './header/headerNav.js';
import {
  HEADER_TAB_ROUTE_MAP,
  isComingSoonHeaderPath,
  resolveActiveTabFromPath,
} from './header/headerTabRoutes.js';
import { SubmitterSidebar } from './sidebar/SubmitterSidebar.js';
import { TAB_SIDEBAR_OFFSET_CLASS } from './sidebar/sidebarConstants.js';
import {
  resolveRouteForSidebarItem,
  resolveSidebarItemFromPath,
  type SubmitterSidebarItemId,
} from './sidebar/submitterSidebarNav.js';

export function SubmitterLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<HeaderNavTabId | null>(DEFAULT_HEADER_NAV_TAB);
  const [isHomeActive, setIsHomeActive] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState<SubmitterSidebarItemId | null>(() =>
    resolveSidebarItemFromPath(location.pathname),
  );

  const showSidebar = !isComingSoonHeaderPath(location.pathname);

  useEffect(() => {
    const tabFromPath = resolveActiveTabFromPath(location.pathname);
    setActiveTab(tabFromPath);
    setIsHomeActive(location.pathname === '/de-tai');
    setActiveSidebarItem(resolveSidebarItemFromPath(location.pathname));
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    performSubmitterLogout();
  }, []);

  const handleHomeClick = useCallback(() => {
    setIsHomeActive(true);
    setActiveTab(null);
    navigate('/de-tai');
  }, [navigate]);

  const handleTabChange = useCallback(
    (tabId: HeaderNavTabId) => {
      setIsHomeActive(false);
      setActiveTab(tabId);
      navigate(HEADER_TAB_ROUTE_MAP[tabId]);
    },
    [navigate],
  );

  const handleSidebarSelect = useCallback(
    (itemId: SubmitterSidebarItemId) => {
      setActiveSidebarItem(itemId);
      navigate(resolveRouteForSidebarItem(itemId));
    },
    [navigate],
  );

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#f0f6fb]">
      <SiteHeader
        activeTab={activeTab}
        isHomeActive={isHomeActive}
        onHomeClick={handleHomeClick}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
      />

      <div className="relative min-h-0 flex-1">
        {showSidebar ? (
          <SubmitterSidebar activeItemId={activeSidebarItem} onItemSelect={handleSidebarSelect} />
        ) : null}

        <main
          className={[
            'min-h-[calc(100vh-110px)] overflow-y-auto bg-[#f0f6fb] px-8 py-8',
            showSidebar ? TAB_SIDEBAR_OFFSET_CLASS : '',
          ].join(' ')}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
