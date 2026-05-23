import type { ReactNode } from 'react';
import type { DashboardNavId } from './dashboardNav.js';

type NavIconProps = { className?: string };

export function NavIconOverview({ className }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
    </svg>
  );
}

export function NavIconHomeOutline({ className }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  );
}

export function NavIconClipboardOutline({ className }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 4h6a1 1 0 0 1 1 1v15l-4-2-4 2V5a1 1 0 0 1 1-1z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" />
    </svg>
  );
}

export function NavIconListOutline({ className }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

export function NavIconPlusCircleOutline({ className }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  );
}

export function NavIconWorkflowOutline({ className }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h5v4H4V6zm11 0h5v4h-5V6zM4 14h5v4H4v-4zm11 2h5m-2.5-2.5v5"
      />
    </svg>
  );
}

export function BrandBookIcon({ className }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 5a2 2 0 0 1 2-2h5v16H6a2 2 0 0 1-2-2V5zm16-2h-5v16h5a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"
      />
    </svg>
  );
}

export function LogoutIcon({ className }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 5h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"
      />
    </svg>
  );
}

const iconCls = 'h-[18px] w-[18px] shrink-0';

export function DashboardNavIcon({ id }: { id: DashboardNavId }): ReactNode {
  const cls = iconCls;
  switch (id) {
    case 'overview':
      return <NavIconOverview className={cls} />;
    case 'project-mgmt':
      return <NavIconHomeOutline className={cls} />;
    case 'implementation-progress':
      return <NavIconClipboardOutline className={cls} />;
    case 'research-data':
      return <NavIconListOutline className={cls} />;
    case 'new-data':
      return <NavIconPlusCircleOutline className={cls} />;
    case 'process':
      return <NavIconWorkflowOutline className={cls} />;
    default: {
      const _n: never = id;
      return _n;
    }
  }
}
