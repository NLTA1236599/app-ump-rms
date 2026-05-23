import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  children: ReactNode;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50';
  const styles =
    variant === 'primary'
      ? 'bg-chrome-primary text-white shadow-sm hover:brightness-[0.92] focus:ring-chrome-primary/50'
      : variant === 'secondary'
        ? 'bg-white border border-jira-border text-slate-800 hover:bg-slate-50 focus:ring-slate-400'
        : variant === 'danger'
          ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
          : 'text-slate-700 hover:bg-slate-100 focus:ring-slate-300';
  return (
    <button type="button" className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}
