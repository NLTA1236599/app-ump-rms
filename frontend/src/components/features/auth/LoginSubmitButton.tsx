import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function LoginSubmitButton({
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="submit"
      className={`mb-[18px] h-[52px] w-full rounded-xl border-none bg-ump-brand px-4 text-[15px] font-bold uppercase tracking-[0.12em] text-white shadow-ump-btn outline-none transition-[background-color,transform] duration-150 ease-out enabled:cursor-pointer enabled:active:scale-[0.99] enabled:active:bg-ump-brand-active enabled:hover:bg-ump-brand-hover enabled:focus-visible:ring-2 enabled:focus-visible:ring-ump-brand enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
