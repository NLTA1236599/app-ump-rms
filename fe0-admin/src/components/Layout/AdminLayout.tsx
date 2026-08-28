import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Sidebar } from './Sidebar.js';

const STORAGE_KEY = 'ump-admin-sidebar-collapsed';

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore quota / private mode */
      }
      return next;
    });
  }, []);

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      <main className="min-h-0 min-w-0 flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
