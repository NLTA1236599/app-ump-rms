import {
  SUBMITTER_SIDEBAR_ITEMS,
  type SubmitterSidebarItemId,
} from './submitterSidebarNav.js';
import { SidebarMenuItem } from './SidebarMenuItem.js';
import {
  TAB_SIDEBAR_HEIGHT_CLASS,
  TAB_SIDEBAR_TOP_CLASS,
  TAB_SIDEBAR_WIDTH_CLASS,
} from './sidebarConstants.js';

type SubmitterSidebarProps = {
  activeItemId: SubmitterSidebarItemId | null;
  onItemSelect: (id: SubmitterSidebarItemId) => void;
};

/** Fixed left sidebar — matches port 5173 `TabSidebar.tsx` shell. */
export function SubmitterSidebar({ activeItemId, onItemSelect }: SubmitterSidebarProps) {
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
        {SUBMITTER_SIDEBAR_ITEMS.map((item) => (
          <SidebarMenuItem
            key={item.id}
            id={item.id}
            label={item.label}
            isActive={activeItemId === item.id}
            onSelect={onItemSelect}
          />
        ))}
      </nav>
    </aside>
  );
}
