import type { ReactNode } from 'react';

type Props = {
  label: string;
  icon?: ReactNode;
  colSpan: number;
};

export function SectionHeaderRow({ label, icon, colSpan }: Props) {
  return (
    <tr>
      <td colSpan={colSpan} className="border-y border-slate-200 bg-slate-100 px-4 py-2">
        <div className="flex items-center gap-2">
          {icon ? <span className="text-slate-500">{icon}</span> : null}
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">{label}</span>
        </div>
      </td>
    </tr>
  );
}
