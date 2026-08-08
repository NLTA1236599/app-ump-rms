import { DeTaiKhcnSidebarIcon } from './sidebarNavIcons.js';
import type { DeTaiKhcnSidebarItemId } from './deTaiKhcnSidebarNav.js';

type SidebarMenuItemProps = {
  id: DeTaiKhcnSidebarItemId;
  label: string;
  isActive: boolean;
  collapsed?: boolean;
  badgeCount?: number;
  onSelect: (id: DeTaiKhcnSidebarItemId) => void;
};

export function SidebarMenuItem({
  id,
  label,
  isActive,
  collapsed = false,
  badgeCount,
  onSelect,
}: SidebarMenuItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-current={isActive ? 'page' : undefined}
      title={collapsed ? label : undefined}
      className={[
        'flex w-full items-center border-l-4 text-left text-sm transition-colors duration-150',
        collapsed ? 'justify-center gap-0 px-2 py-2.5' : 'gap-2.5 px-3 py-2',
        isActive
          ? 'border-[#0072bc] bg-blue-50 font-semibold text-blue-700'
          : 'border-transparent font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600',
      ].join(' ')}
    >
      <span className={`relative ${isActive ? 'text-[#0072bc]' : 'text-slate-500'}`}>
        <DeTaiKhcnSidebarIcon id={id} />
        {collapsed && badgeCount != null && badgeCount > 0 ? (
          <span className="absolute -right-1.5 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-violet-600 px-0.5 text-[9px] font-bold text-white">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        ) : null}
      </span>
      {!collapsed ? (
        <span className="flex w-full items-center justify-between gap-2">
          <span className="truncate text-[13px] font-medium">{label}</span>
          {badgeCount != null && badgeCount > 0 ? (
            <span
              className="ml-1 flex-shrink-0 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px]
                         font-black text-violet-700"
            >
              {badgeCount}
            </span>
          ) : null}
        </span>
      ) : null}
    </button>
  );
}
