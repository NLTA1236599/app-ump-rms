import { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { TrendDatum } from './projectAnalytics.js';

export type TrendChartProps = {
  data: TrendDatum[];
};

export function TrendChart({ data }: TrendChartProps) {
  const [range, setRange] = useState<[number, number] | null>(null);

  const bounds = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 0 };
    return { min: 0, max: Math.max(0, data.length - 1) };
  }, [data.length]);

  const activeRange = range ?? [bounds.min, bounds.max];
  const sliced = data.slice(activeRange[0], activeRange[1] + 1);

  const startLabel = data[activeRange[0]]?.period ?? '';
  const endLabel = data[activeRange[1]]?.period ?? '';

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="bg-[#1a6ec2] px-2 py-1.5">
        <h3 className="text-[11px] font-bold text-white">
          Đề tài đăng ký và hoàn thành theo Năm
        </h3>
        <p className="text-[9px] text-white/80">Xu hướng theo thời gian (dual-axis)</p>
      </div>

      <div className="p-1.5">
        <div className="h-[120px]">
          {sliced.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={sliced} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                  allowDecimals={false}
                  width={28}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                  allowDecimals={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '6px',
                    fontSize: '11px',
                    border: '1px solid #e2e8f0',
                  }}
                  formatter={(value, name) => [
                    `${value ?? 0} đề tài`,
                    name === 'registered' ? 'Đề tài đăng ký' : 'Đề tài hoàn thành',
                  ]}
                  labelFormatter={(label) => `Năm: ${label}`}
                />
                <Legend
                  iconType="circle"
                  iconSize={6}
                  formatter={(value) =>
                    value === 'registered' ? 'Đề tài đăng ký' : 'Đề tài hoàn thành'
                  }
                  wrapperStyle={{ fontSize: '10px' }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="registered"
                  fill="#dbeafe"
                  stroke="#3b82f6"
                  fillOpacity={0.6}
                  strokeWidth={1.5}
                  dot={false}
                  name="registered"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="completed"
                  stroke="#1a6ec2"
                  strokeWidth={1.75}
                  dot={{ r: 2, fill: '#1a6ec2' }}
                  activeDot={{ r: 3 }}
                  name="completed"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-[11px] text-slate-400">
              Chưa có dữ liệu xu hướng
            </div>
          )}
        </div>

        {data.length > 1 ? (
          <div className="mt-1.5 space-y-1">
            <div className="flex items-center justify-between text-[9px] text-slate-400">
              <span>{startLabel || data[0]?.period}</span>
              <span>{endLabel || data[data.length - 1]?.period}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={bounds.min}
                max={bounds.max}
                value={activeRange[0]}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setRange([Math.min(next, activeRange[1]), activeRange[1]]);
                }}
                className="w-full accent-[#1a6ec2]"
                aria-label="Đầu khoảng thời gian"
              />
              <input
                type="range"
                min={bounds.min}
                max={bounds.max}
                value={activeRange[1]}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setRange([activeRange[0], Math.max(next, activeRange[0])]);
                }}
                className="w-full accent-[#1a6ec2]"
                aria-label="Cuối khoảng thời gian"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
