import { getCategoryColor, getCategoryLabel } from './chartColors.js';
import type { DynYAxis } from './types.js';

type TooltipEntry = {
  dataKey?: string | number;
  name?: string;
  value?: number | string;
  color?: string;
  payload?: { nameFull?: string; name?: string };
};

export type StackedBarTooltipProps = {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  dynYAxis?: DynYAxis;
};

function formatValue(value: number, dynYAxis: DynYAxis): string {
  const formatted = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value);
  return dynYAxis === 'budget' ? `${formatted} triệu` : formatted;
}

export function StackedBarTooltip({
  active,
  payload,
  label,
  dynYAxis = 'count',
}: StackedBarTooltipProps) {
  if (!active || !payload?.length) return null;

  const validEntries = payload.filter((entry) => Number(entry.value) > 0);
  if (validEntries.length === 0) return null;

  const total = validEntries.reduce((sum, entry) => sum + Number(entry.value), 0);
  const title = String(validEntries[0]?.payload?.nameFull ?? validEntries[0]?.payload?.name ?? label ?? '');

  return (
    <div className="min-w-[180px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-2 border-b border-slate-100 pb-2 text-xs font-bold text-slate-800">{title}</p>
      <div className="space-y-1.5">
        {validEntries.map((entry, index) => {
          const key = String(entry.dataKey ?? entry.name ?? index);
          const value = Number(entry.value);
          const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
          const color = getCategoryColor(key, index);

          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color ?? color }}
                />
                <span className="truncate text-xs text-slate-600">{getCategoryLabel(key)}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-right">
                <span className="text-xs font-bold text-slate-800">{formatValue(value, dynYAxis)}</span>
                <span className="text-[10px] text-slate-400">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="text-xs font-bold text-slate-500">Tổng cộng</span>
        <span className="text-sm font-bold text-[#1a6ec2]">
          {dynYAxis === 'budget' ? `${formatValue(total, dynYAxis)} VNĐ` : `${formatValue(total, dynYAxis)} đề tài`}
        </span>
      </div>
    </div>
  );
}
