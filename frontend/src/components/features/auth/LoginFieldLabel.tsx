import type { LabelHTMLAttributes, ReactNode } from 'react';

export function LoginFieldLabel({
  children,
  className = '',
  ...rest
}: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return (
    <label
      className={`mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.10em] text-ump-text-label ${className}`}
      {...rest}
    >
      {children}
    </label>
  );
}
