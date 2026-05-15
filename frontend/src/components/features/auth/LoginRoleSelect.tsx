import type { ReactNode, SelectHTMLAttributes } from 'react';

import type { LoginRoleValue } from './loginRoleOptions.js';

const CHEVRON = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A7FA8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`
);

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  value: LoginRoleValue;
  onRoleChange: (value: LoginRoleValue) => void;
  children: ReactNode;
};

export function LoginRoleSelect({
  children,
  className = '',
  value,
  onRoleChange,
  ...rest
}: Props) {
  return (
    <select
      className={`h-12 w-full cursor-pointer appearance-none rounded-[10px] border-[1.5px] border-ump-border-input bg-white px-4 pr-10 text-[14px] font-medium text-ump-navy outline-none transition-[border-color,box-shadow] duration-150 ease-in-out focus:border-ump-icon focus:shadow-ump-focus ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml;charset=utf-8,${CHEVRON}")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 16px center',
      }}
      value={value}
      onChange={(e) => onRoleChange(e.target.value as LoginRoleValue)}
      {...rest}
    >
      {children}
    </select>
  );
}
