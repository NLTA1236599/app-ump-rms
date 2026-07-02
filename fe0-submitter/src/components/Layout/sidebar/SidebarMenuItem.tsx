import { SubmitterSidebarIcon } from './sidebarNavIcons.js';
import type { SubmitterSidebarItemId } from './submitterSidebarNav.js';

type SidebarMenuItemProps = {
  id: SubmitterSidebarItemId;
  label: string;
  isActive: boolean;
  onSelect: (id: SubmitterSidebarItemId) => void;
};

/** Menu row styling — matches port 5173 `SidebarMenuItem.tsx`. */
export function SidebarMenuItem({ id, label, isActive, onSelect }: SidebarMenuItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'flex w-full items-center gap-3 border-l-4 px-4 py-3 text-left text-sm transition-colors duration-150',
        isActive
          ? 'border-[#0072bc] bg-blue-50 font-semibold text-blue-700'
          : 'border-transparent font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600',
      ].join(' ')}
    >
      <span className={isActive ? 'text-[#0072bc]' : 'text-slate-500'}>
        <SubmitterSidebarIcon id={id} />
      </span>
      <span className="truncate text-sm font-medium">{label}</span>
    </button>
  );
}
