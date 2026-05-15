import type { InputHTMLAttributes } from 'react';

const inputBase =
  'h-12 w-full rounded-[10px] border-[1.5px] border-ump-border-input bg-white px-4 text-[14px] text-ump-navy outline-none transition-[border-color,box-shadow] duration-150 ease-in-out placeholder:text-ump-placeholder focus:border-ump-icon focus:shadow-ump-focus';

export function LoginTextInput({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputBase} ${className}`} {...rest} />;
}
