import { useMemo } from 'react';

import { computeDuplicateStats, getDuplicateGroups } from '../detectingtitletab/index.js';

import {
  DE_TAI_KHCN_SIDEBAR_ITEMS,
  type DeTaiKhcnSidebarItemId,
} from './deTaiKhcnSidebarNav.js';
import { SidebarMenuItem } from './SidebarMenuItem.js';
import {
  TAB_SIDEBAR_HEIGHT_CLASS,
  TAB_SIDEBAR_TOP_CLASS,
  TAB_SIDEBAR_WIDTH_CLASS,
} from './sidebarConstants.js';
import type { ResearchProject as TableProject } from '../DataTable/types.js';

type TabSidebarProps = {
  activeItemId: DeTaiKhcnSidebarItemId;
  onItemSelect: (id: DeTaiKhcnSidebarItemId) => void;
  tableProjects?: TableProject[];
};

/** Fixed left sidebar for "Đề tài KHCN" — spec: `BHXH-sidebar-analysis.md` */
export function TabSidebar({ activeItemId, onItemSelect, tableProjects = [] }: TabSidebarProps) {
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
        'overflow-x-hidden overflow-y-auto',
        TAB_SIDEBAR_TOP_CLASS,
        TAB_SIDEBAR_HEIGHT_CLASS,
        TAB_SIDEBAR_WIDTH_CLASS,
      ].join(' ')}
    >
      <nav className="py-2">
        {DE_TAI_KHCN_SIDEBAR_ITEMS.map((item) => (
          <SidebarMenuItem
            key={item.id}
            id={item.id}
            label={item.label}
            isActive={activeItemId === item.id}
            badgeCount={item.id === 'loc-trung-de-tai' ? duplicateGroupCount : undefined}
            onSelect={onItemSelect}
          />
        ))}
      </nav>
    </aside>
  );
}
