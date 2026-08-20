import type { ChartLegendItem } from './chartPieLayout.js';

export function ChartLegendList({
  items,
  className = '',
}: {
  items: ChartLegendItem[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-x-2.5 gap-y-0.5 ${className}`}>
      {items.map((item) => (
        <li key={item.name} className="flex min-w-0 max-w-full items-center gap-1">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          <span className="truncate text-[10px] leading-snug text-slate-600" title={item.name}>
            {item.name}
            {item.detail ? <span className="text-slate-400"> · {item.detail}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
