import type { LabelHTMLAttributes, ReactNode } from 'react';

type RegisterFieldLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
  children: ReactNode;
};

export function RegisterFieldLabel({ required, children, className = '', ...rest }: RegisterFieldLabelProps) {
  return (
    <label
      className={`mb-1 block text-left text-[13px] font-medium text-[#374151] ${className}`}
      {...rest}
    >
      {children}
      {required ? <span className="text-[#ef4444]"> *</span> : null}
    </label>
  );
}
