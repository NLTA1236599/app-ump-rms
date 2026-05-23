import type { ReactNode } from 'react';

type RegisterSectionGroupProps = {
  icon: string;
  title: string;
  sub: string;
  children: ReactNode;
};

/** Group header strip + fieldset (`register-component-analysis.md` §6–9, §19). */
export function RegisterSectionGroup({ icon, title, sub, children }: RegisterSectionGroupProps) {
  return (
    <fieldset className="mt-5 border-0 p-0 first:mt-0">
      <legend className="sr-only">
        {title} — {sub}
      </legend>
      <div className="mb-4 flex flex-col gap-1 rounded-lg bg-[#dbeafe] px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3">
        <span className="text-[20px] leading-none" aria-hidden>
          {icon}
        </span>
        <div className="min-w-0 text-left">
          <p className="text-[14px] font-bold text-[#1a1a1a]">{title}</p>
          <p className="text-[12px] text-[#9ca3af]">{sub}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  );
}
