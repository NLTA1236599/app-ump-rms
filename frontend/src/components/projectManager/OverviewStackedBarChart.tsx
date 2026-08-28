import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { abbreviateUnitName } from './abbreviateUnitName.js';
import { getCategoryColor, getCategoryLabel } from './chartColors.js';
import type { StackedChartModel } from './projectAnalytics.js';
import { StackedBarTooltip, type StackedBarTooltipProps } from './StackedBarTooltip.js';
import type { DynYAxis } from './types.js';

type Props = {
  model: StackedChartModel;
  dynYAxis: DynYAxis;
  compact?: boolean;
  categoryLabel?: string;
  stackLabel?: string;
  yearLabel?: string;
};

export function OverviewStackedBarChart({
  model,
  dynYAxis,
  compact = false,
  categoryLabel = 'Đơn vị',
  stackLabel,
  yearLabel,
}: Props) {
  const valueAxisLabel = dynYAxis === 'budget' ? 'Kinh phí (triệu VNĐ)' : 'Số đề tài';
  const nameMaxLen = compact ? 18 : 26;
  const rowHeight = compact ? 28 : 36;
  const yAxisWidth = compact ? 124 : 168;
  const tickSize = compact ? 10 : 12;

  const chartData = model.data.map((row) => ({
    ...row,
    nameDisplay: abbreviateUnitName(String(row.name), nameMaxLen),
    nameFull: String(row.name),
  }));

  const totalValue = model.data.reduce((sum, row) => {
    return sum + model.series.reduce((acc, key) => acc + (Number(row[key]) || 0), 0);
  }, 0);

  const totalDisplay =
    dynYAxis === 'budget'
      ? `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(totalValue)} triệu`
      : `${new Intl.NumberFormat('vi-VN').format(totalValue)} đề tài`;

  const subtitleParts = [
    yearLabel,
    stackLabel ? `Chồng theo ${stackLabel}` : null,
    `${chartData.length} ${categoryLabel.toLowerCase()}`,
    dynYAxis === 'count' ? `${new Intl.NumberFormat('vi-VN').format(totalValue)} đề tài` : null,
  ].filter(Boolean);

  const chartHeight = Math.max(compact ? 180 : 280, chartData.length * rowHeight);
  const formatTick = (val: number) =>
    dynYAxis === 'budget' ? new Intl.NumberFormat('vi-VN').format(val) : String(val);

  return (
    <div className="flex h-full min-h-0 flex-col px-1 pb-1 pt-0.5">
      <div className="mb-2 flex shrink-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Phân bổ đề tài theo {categoryLabel}
          </h4>
          <p className="mt-0.5 truncate text-[10px] text-slate-400">{subtitleParts.join(' · ')}</p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
          {totalDisplay}
        </span>
      </div>

      <ul className="mb-1.5 flex shrink-0 flex-wrap gap-x-3 gap-y-1">
        {model.series.map((key, index) => (
          <li key={key} className="flex items-center gap-1">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: getCategoryColor(key, index) }}
            />
            <span className="text-[10px] leading-none text-slate-600">{getCategoryLabel(key)}</span>
          </li>
        ))}
      </ul>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-md">
        <div style={{ height: chartHeight, minHeight: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: compact ? 20 : 36, left: 4, bottom: 22 }}
              barCategoryGap="18%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: tickSize, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatTick}
                label={{
                  value: valueAxisLabel,
                  position: 'insideBottomRight',
                  offset: -2,
                  style: { fontSize: compact ? 9 : 11, fill: '#94a3b8', fontWeight: 600 },
                }}
              />
              <YAxis
                type="category"
                dataKey="nameDisplay"
                width={yAxisWidth}
                interval={0}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: tickSize, fill: '#374151' }}
              />
              <Tooltip
                content={({ active, payload, label }) => (
                  <StackedBarTooltip
                    active={active}
                    payload={payload as unknown as StackedBarTooltipProps['payload']}
                    label={label != null ? String(label) : ''}
                    dynYAxis={dynYAxis}
                  />
                )}
                cursor={{ fill: '#f1f5f9', opacity: 0.7 }}
              />
              {model.series.map((key, index) => {
                const isLast = index === model.series.length - 1;
                return (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={getCategoryLabel(key)}
                    stackId="stack"
                    fill={getCategoryColor(key, index)}
                    radius={isLast ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                    maxBarSize={compact ? 16 : 22}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
