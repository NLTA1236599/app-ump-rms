import type { ReactNode } from 'react';

type AuthTabPanelProps = {
  id: string;
  ariaLabelledBy: string;
  hidden: boolean;
  children: ReactNode;
};

/** `role="tabpanel"` wrapper — matches `login-component-analysis.md` §12. */
export function AuthTabPanel({ id, ariaLabelledBy, hidden, children }: AuthTabPanelProps) {
  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={ariaLabelledBy}
      hidden={hidden}
      className="outline-none"
    >
      {children}
    </div>
  );
}
