import { useMemo } from 'react';

import { computeDuplicateStats, getDuplicateGroups } from '../detectingtitletab/index.js';
import type { ResearchProject as TableProject } from '../DataTable/types.js';

import {
  DE_TAI_KHCN_SIDEBAR_ITEMS,
  type DeTaiKhcnSidebarItemId,
} from './deTaiKhcnSidebarNav.js';
import { SidebarMenuItem } from './SidebarMenuItem.js';
import {
  TAB_SIDEBAR_COLLAPSED_WIDTH_CLASS,
  TAB_SIDEBAR_HEIGHT_CLASS,
  TAB_SIDEBAR_TOP_CLASS,
  TAB_SIDEBAR_WIDTH_CLASS,
} from './sidebarConstants.js';

type TabSidebarProps = {
  activeItemId: DeTaiKhcnSidebarItemId;
  onItemSelect: (id: DeTaiKhcnSidebarItemId) => void;
  tableProjects?: TableProject[];
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
};

/** Fixed left sidebar for "Đề tài KHCN" — spec: `BHXH-sidebar-analysis.md` */
export function TabSidebar({
  activeItemId,
  onItemSelect,
  tableProjects = [],
  collapsed = false,
  onToggleCollapsed,
}: TabSidebarProps) {
  const duplicateGroupCount = useMemo(() => {
    const groups = getDuplicateGroups(tableProjects, {
      yearFrom: null,
      yearTo: null,
      matchMode: 'strict',
    });
    return computeDuplicateStats(groups).groupCount;
  }, [tableProjects]);

  return (
    <aside
      aria-label="Menu điều hướng"
      className={[
        'fixed left-0 z-40 border-r border-slate-200 bg-white shadow-[2px_0_8px_rgba(0,0,0,0.08)]',
        'overflow-x-hidden overflow-y-auto transition-[width] duration-200',
        TAB_SIDEBAR_TOP_CLASS,
        TAB_SIDEBAR_HEIGHT_CLASS,
        collapsed ? TAB_SIDEBAR_COLLAPSED_WIDTH_CLASS : TAB_SIDEBAR_WIDTH_CLASS,
      ].join(' ')}
    >
      <div
        className={[
          'flex items-center border-b border-slate-100',
          collapsed ? 'justify-center px-1 py-2' : 'justify-between gap-2 px-2.5 py-2',
        ].join(' ')}
      >
        {!collapsed ? (
          <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Menu
          </span>
        ) : null}
        <button
          type="button"
          onClick={onToggleCollapsed}
          title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          aria-expanded={!collapsed}
          className={[
            'inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50',
            'text-[11px] font-semibold text-slate-600 transition-colors',
            'hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700',
            collapsed ? 'p-1.5' : 'px-2 py-1.5',
          ].join(' ')}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {collapsed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            )}
          </svg>
          {!collapsed ? <span>Thu gọn</span> : null}
        </button>
      </div>

      <nav className="py-1">
        {DE_TAI_KHCN_SIDEBAR_ITEMS.map((item) => (
          <SidebarMenuItem
            key={item.id}
            id={item.id}
            label={item.label}
            isActive={activeItemId === item.id}
            collapsed={collapsed}
            badgeCount={item.id === 'loc-trung-de-tai' ? duplicateGroupCount : undefined}
            onSelect={onItemSelect}
          />
        ))}
      </nav>
    </aside>
  );
}
