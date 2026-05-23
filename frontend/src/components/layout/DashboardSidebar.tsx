import { BrandBookIcon, DashboardNavIcon, LogoutIcon } from './dashboardNavIcons.js';
import { DASHBOARD_NAV_ITEMS, type DashboardNavId } from './dashboardNav.js';

export type WorkspaceNavEntry = { id: string; name: string };

export type SidebarProps = {
  activeNavId: DashboardNavId;
  onNavigate: (id: DashboardNavId) => void;
  userLabel: string;
  onLogout: () => void;
  workspaces?: WorkspaceNavEntry[];
  activeWorkspaceId?: string | null;
  onSelectWorkspace?: (id: string) => void;
  onCreateWorkspace?: () => void;
};

function parseUserLabel(userLabel: string): { display: string; role: string } {
  const idx = userLabel.indexOf(' · ');
  if (idx === -1) return { display: userLabel, role: '' };
  return {
    display: userLabel.slice(0, idx).trim(),
    role: userLabel.slice(idx + 3).trim(),
  };
}

export function Sidebar({
  activeNavId,
  onNavigate,
  userLabel,
  onLogout,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
}: SidebarProps) {
  const { display, role } = parseUserLabel(userLabel);
  const hasWorkspaces = Boolean(workspaces?.length);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col border-r border-chrome-divider bg-chrome-surface px-[18px] pb-4 pt-4">
      <div className="mb-7 flex items-center gap-2.5">
        <BrandBookIcon className="h-[18px] w-[18px] text-chrome-primary" />
        <span className="text-base font-bold text-chrome-primary">UMP-RMS</span>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Điều hướng chính">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const active = item.id === activeNavId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={[
                'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors',
                active
                  ? 'border-l-[3px] border-chrome-primary bg-chrome-primary-light font-semibold text-chrome-primary -ml-px pl-[calc(0.625rem-3px)]'
                  : 'border-l-[3px] border-transparent font-normal text-chrome-text-body hover:bg-chrome-hover',
              ].join(' ')}
            >
              <span className={active ? 'text-chrome-primary' : 'text-chrome-text-muted'}>
                <DashboardNavIcon id={item.id} />
              </span>
              <span className="min-w-0 flex-1 leading-snug">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {hasWorkspaces ? (
        <div className="mt-4 max-h-44 overflow-y-auto border-t border-chrome-divider pt-3">
          <p className="mb-2 px-0.5 text-[10px] font-semibold uppercase tracking-wide text-chrome-text-faint">
            Workspace
          </p>
          <div className="flex flex-col gap-0.5">
            {workspaces!.map((ws) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => onSelectWorkspace?.(ws.id)}
                className={[
                  'rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                  ws.id === activeWorkspaceId
                    ? 'bg-chrome-primary-light font-medium text-chrome-primary'
                    : 'text-chrome-text-body hover:bg-chrome-hover',
                ].join(' ')}
              >
                {ws.name}
              </button>
            ))}
            {onCreateWorkspace ? (
              <button
                type="button"
                onClick={onCreateWorkspace}
                className="mt-1 rounded-md px-2 py-1.5 text-left text-xs font-medium text-chrome-primary hover:bg-chrome-primary-light"
              >
                + Tạo workspace
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-auto border-t border-chrome-divider pt-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-chrome-hover px-2.5 py-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-chrome-divider text-chrome-text-muted"
            aria-hidden
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM4 21a8 8 0 0 1 16 0"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] text-chrome-text-body">{display}</p>
            {role ? (
              <p className="truncate text-[11px] font-medium uppercase tracking-wide text-chrome-text-muted">{role}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="shrink-0 rounded-md p-1 text-chrome-text-faint hover:bg-white hover:text-chrome-text-muted"
            aria-label="Đăng xuất"
          >
            <LogoutIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
