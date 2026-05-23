import type { ReactNode } from 'react';
import { LoginBackground } from '../features/auth/LoginBackground.js';
import { LoginPageFooter } from '../features/auth/LoginPageFooter.js';

type LoginPageShellProps = {
  children: ReactNode;
  /** Wider column for register form (`register-component-analysis.md` §16). */
  contentMaxClassName?: string;
};

/**
 * Full-viewport auth layout: backdrop + vertically centered column (analysis §1, §10).
 * Branding + card live in `children` for a single-column flow.
 */
export function LoginPageShell({
  children,
  contentMaxClassName = 'max-w-[420px]',
}: LoginPageShellProps) {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden font-sans text-ump-navy">
      <LoginBackground />

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4 py-10 pb-20">
        <div className={`flex w-full shrink-0 flex-col items-stretch gap-6 ${contentMaxClassName}`}>
          {children}
        </div>
      </div>

      <LoginPageFooter />
    </div>
  );
}
