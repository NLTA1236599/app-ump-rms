import { type RefObject, type Ref } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartLegendList } from './ChartLegendList.js';
import { PIE_INNER_PCT, PIE_OUTER_PCT } from './chartPieLayout.js';
import { exportChartToExcel } from './exportChartToExcel.js';
import { formatTooltipDynamic } from './chartTooltipFormat.js';
import {
  BAR_COLOR_ROTATION,
  DYN_X_OPTIONS,
  DYN_Y_OPTIONS,
  type DynamicDatum,
} from './projectAnalytics.js';
import type { DynChartType, DynYAxis } from './types.js';

export type DynamicStatisticChartProps = {
  dynamicChartRef: RefObject<HTMLDivElement | null>;
  dynamicChartData: DynamicDatum[];
  availableYears: string[];
  dynChartType: DynChartType;
  dynXAxis: string;
  dynYAxis: DynYAxis;
  dynChartYear: string;
  onDynChartType: (v: DynChartType) => void;
  onDynXAxis: (v: string) => void;
  onDynYAxis: (v: DynYAxis) => void;
  onDynChartYear: (v: string) => void;
  onExpand: () => void;
};

export function DynamicStatisticChart({
  dynamicChartRef,
  dynamicChartData,
  availableYears,
  dynChartType,
  dynXAxis,
  dynYAxis,
  dynChartYear,
  onDynChartType,
  onDynXAxis,
  onDynYAxis,
  onDynChartYear,
  onExpand,
}: DynamicStatisticChartProps) {
  const yLabel = dynYAxis === 'budget' ? 'Kinh phí' : 'Số lượng';

  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-[#1a6ec2] px-2 py-1.5">
        <div>
          <h3 className="text-[11px] font-bold text-white">Biểu đồ Thống kê</h3>
          <p className="text-[9px] text-white/80">Tuỳ chọn loại biểu đồ, trục và năm</p>
        </div>
        <div className="flex space-x-0.5 opacity-90 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onExpand}
            className="rounded bg-white/15 p-1 text-white/90 transition-colors hover:bg-white/25"
            title="Phóng to"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() =>
              void exportChartToExcel({
                chartRef: dynamicChartRef,
                data: dynamicChartData,
                columns: [
                  { header: 'Tên', key: 'name', width: 40 },
                  { header: dynYAxis === 'count' ? 'Số lượng' : 'Kinh phí', key: 'value', width: 25 },
                ],
                filename: 'Bieu_do_thong_ke',
                sheetName: 'Thống kê',
              })
            }
            className="rounded bg-white/15 p-1 text-white/90 transition-colors hover:bg-white/25"
            title="Xuất Excel"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="p-1.5">

      <div className="mb-1.5 flex flex-wrap items-center gap-1.5 rounded-md border border-slate-100 bg-slate-50 p-1.5">
        <div className="min-w-[140px] flex-1">
          <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-500">
            Loại biểu đồ
          </label>
          <select
            value={dynChartType}
            onChange={(e) => onDynChartType(e.target.value as DynChartType)}
            className="block w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 outline-none transition focus:border-[#1a6ec2] focus:ring-1 focus:ring-[#1a6ec2]"
          >
            <option value="bar">Biểu đồ Cột (Bar)</option>
            <option value="line">Biểu đồ Đường (Line)</option>
            <option value="pie">Biểu đồ Tròn (Pie)</option>
          </select>
        </div>

        {dynChartType === 'pie' ? (
          <div className="min-w-[140px] flex-1">
            <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Yếu tố cần thống kê
            </label>
            <select
              value={dynXAxis}
              onChange={(e) => onDynXAxis(e.target.value)}
              className="block w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 outline-none transition focus:border-[#1a6ec2] focus:ring-1 focus:ring-[#1a6ec2]"
            >
              {DYN_X_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="min-w-[140px] flex-1">
            <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Trục X (Category)
            </label>
            <select
              value={dynXAxis}
              onChange={(e) => onDynXAxis(e.target.value)}
              className="block w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 outline-none transition focus:border-[#1a6ec2] focus:ring-1 focus:ring-[#1a6ec2]"
            >
              {DYN_X_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="min-w-[140px] flex-1">
          <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-500">
            {dynChartType === 'pie' ? 'Giá trị' : 'Trục Y (Value)'}
          </label>
          <select
            value={dynYAxis}
            onChange={(e) => onDynYAxis(e.target.value as DynYAxis)}
            className="block w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 outline-none transition focus:border-[#1a6ec2] focus:ring-1 focus:ring-[#1a6ec2]"
          >
            {DYN_Y_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[140px] flex-1">
          <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-500">
            Chọn năm
          </label>
          <select
            value={dynChartYear}
            onChange={(e) => onDynChartYear(e.target.value)}
            className="block w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 outline-none transition focus:border-[#1a6ec2] focus:ring-1 focus:ring-[#1a6ec2]"
          >
            <option value="all">Tất cả các năm</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative h-[clamp(140px,24vh,200px)] overflow-hidden rounded-md bg-white" ref={dynamicChartRef as Ref<HTMLDivElement>}>
        {dynamicChartData.length > 0 ? (
          dynChartType === 'pie' ? (
              <div className="flex h-full min-h-0 flex-col gap-1 lg:flex-row lg:items-center">
                <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                      <Pie
                        data={dynamicChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={PIE_INNER_PCT}
                        outerRadius={PIE_OUTER_PCT}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {dynamicChartData.map((_, index) => (
                          <Cell
                            key={`p-${index}`}
                            fill={BAR_COLOR_ROTATION[index % BAR_COLOR_ROTATION.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                        formatter={(v) => formatTooltipDynamic(v, dynYAxis, yLabel)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ChartLegendList
                  items={dynamicChartData.map((d, index) => ({
                    name: d.name,
                    color: BAR_COLOR_ROTATION[index % BAR_COLOR_ROTATION.length],
                    detail: String(d.value),
                  }))}
                  className="max-h-[64px] overflow-y-auto px-1 lg:max-h-full lg:w-[36%] lg:flex-col lg:flex-nowrap"
                />
              </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            {dynChartType === 'bar' ? (
              <BarChart
                data={dynamicChartData}
                margin={{ top: 12, right: 16, left: 4, bottom: 36 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  height={40}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={36}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  tickFormatter={(val) =>
                    dynYAxis === 'budget' ? new Intl.NumberFormat('vi-VN').format(val) : String(val)
                  }
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '6px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '11px',
                  }}
                  formatter={(v) => formatTooltipDynamic(v, dynYAxis, yLabel)}
                />
                <Bar dataKey="value" name={yLabel} radius={[3, 3, 0, 0]}>
                  {dynamicChartData.map((_, index) => (
                    <Cell key={`c-${index}`} fill={BAR_COLOR_ROTATION[index % BAR_COLOR_ROTATION.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <LineChart data={dynamicChartData} margin={{ top: 12, right: 16, left: 4, bottom: 36 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  height={40}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={36}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  tickFormatter={(val) =>
                    dynYAxis === 'budget' ? new Intl.NumberFormat('vi-VN').format(val) : String(val)
                  }
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '6px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '11px',
                  }}
                  formatter={(v) => formatTooltipDynamic(v, dynYAxis, yLabel)}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#9333ea"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#9333ea', strokeWidth: 1, stroke: '#fff' }}
                  activeDot={{ r: 4, strokeWidth: 0, stroke: '#fff' }}
                  name={yLabel}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <svg className="mb-3 h-12 w-12 text-slate-300 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p className="text-sm font-semibold tracking-wide">Chưa có dữ liệu</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
