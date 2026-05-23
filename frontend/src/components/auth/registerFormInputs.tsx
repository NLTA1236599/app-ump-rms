import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

const baseInput =
  'w-full rounded-lg border bg-white px-3 py-2.5 text-[14px] text-[#1a1a1a] outline-none transition-[border-color,box-shadow] placeholder:text-[#9ca3af]';

type RegisterFormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function RegisterFormInput({ invalid, className = '', ...rest }: RegisterFormInputProps) {
  const border = invalid
    ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-2 focus:ring-[rgba(239,68,68,0.2)]'
    : 'border-[#d6cfc6] focus:border-[#374151] focus:ring-2 focus:ring-[rgba(55,65,81,0.15)]';
  return <input className={`${baseInput} ${border} ${className}`} {...rest} />;
}

type RegisterFormSelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export function RegisterFormSelect({ invalid, className = '', children, ...rest }: RegisterFormSelectProps) {
  const border = invalid
    ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-2 focus:ring-[rgba(239,68,68,0.2)]'
    : 'border-[#d6cfc6] focus:border-[#374151] focus:ring-2 focus:ring-[rgba(55,65,81,0.15)]';
  return (
    <select className={`${baseInput} cursor-pointer ${border} ${className}`} {...rest}>
      {children}
    </select>
  );
}
