import type { ReactNode } from 'react';
import type { Workspace } from '../../types/index.js';
import { Button } from '../ui/Button.js';

export function Sidebar({
  workspaces,
  activeId,
  onSelect,
  onCreateWorkspace,
}: {
  workspaces: Workspace[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreateWorkspace: () => void;
}) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-black/10 bg-jira-nav text-white">
      <div className="border-b border-white/10 px-4 py-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Workspaces</div>
        <Button
          variant="secondary"
          className="mt-3 w-full border-white/40 bg-white/10 text-white hover:bg-white/20 focus:ring-white"
          type="button"
          onClick={onCreateWorkspace}
        >
          + New workspace
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {workspaces.length === 0 ? (
          <p className="px-3 text-sm text-white/70">Create a workspace to start.</p>
        ) : (
          <ul className="space-y-1">
            {workspaces.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => onSelect(w.id)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition hover:bg-white/10 ${
                    activeId === w.id ? 'bg-white/15 ring-1 ring-white/30' : ''
                  }`}
                >
                  <div className="font-semibold">{w.name}</div>
                  <div className="text-[11px] text-white/60">{w.keyPrefix}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
}

export function HeaderBar({
  title,
  subtitle,
  userLabel,
  onLogout,
}: {
  title: string;
  subtitle?: string;
  userLabel: string;
  onLogout: () => void;
}) {
  return (
    <header className="flex items-center gap-4 border-b border-jira-border bg-white px-6 py-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-lg font-semibold text-slate-900">{title}</div>
        {subtitle ? <div className="truncate text-sm text-slate-600">{subtitle}</div> : null}
      </div>
      <div className="hidden text-sm text-slate-700 sm:block">{userLabel}</div>
      <Button variant="ghost" type="button" onClick={onLogout}>
        Sign out
      </Button>
    </header>
  );
}

export function MainLayout({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {sidebar}
      <div className="flex min-h-screen flex-1 flex-col">{children}</div>
    </div>
  );
}
