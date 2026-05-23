import type { ReactNode } from 'react';

/** Full-width application shell with sticky site header. */
export function MainLayout({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-50">
      {header}
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
