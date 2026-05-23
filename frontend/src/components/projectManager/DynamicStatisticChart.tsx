import { type RefObject, type Ref } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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
  dynChartType: DynChartType;
  dynXAxis: string;
  dynYAxis: DynYAxis;
  onDynChartType: (v: DynChartType) => void;
  onDynXAxis: (v: string) => void;
  onDynYAxis: (v: DynYAxis) => void;
  onExpand: () => void;
};

export function DynamicStatisticChart({
  dynamicChartRef,
  dynamicChartData,
  dynChartType,
  dynXAxis,
  dynYAxis,
  onDynChartType,
  onDynXAxis,
  onDynYAxis,
  onExpand,
}: DynamicStatisticChartProps) {
  const yLabel = dynYAxis === 'budget' ? 'Kinh phí' : 'Số lượng';

  return (
    <div className="group relative mt-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center">
        <h3 className="flex items-center text-xl font-bold text-slate-800">
          <span className="mr-2 h-6 w-1.5 rounded-full bg-purple-600" />
          Biểu đồ Thống kê
        </h3>
        <div className="opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={onExpand}
              className="rounded-lg bg-slate-50 p-1.5 text-slate-400 transition-colors hover:bg-purple-50 hover:text-purple-600"
              title="Phóng to"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="rounded-lg bg-slate-50 p-1.5 text-slate-400 transition-colors hover:bg-green-50 hover:text-green-600"
              title="Xuất Excel"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Loại biểu đồ
          </label>
          <select
            value={dynChartType}
            onChange={(e) => onDynChartType(e.target.value as DynChartType)}
            className="block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="bar">Biểu đồ Cột (Bar)</option>
            <option value="line">Biểu đồ Đường (Line)</option>
            <option value="pie">Biểu đồ Tròn (Pie)</option>
          </select>
        </div>

        {dynChartType === 'pie' ? (
          <div className="min-w-[200px] flex-1">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Yếu tố cần thống kê
            </label>
            <select
              value={dynXAxis}
              onChange={(e) => onDynXAxis(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-purple-500 focus:ring-purple-500"
            >
              {DYN_X_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="min-w-[200px] flex-1">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Trục X (Category)
            </label>
            <select
              value={dynXAxis}
              onChange={(e) => onDynXAxis(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-purple-500 focus:ring-purple-500"
            >
              {DYN_X_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {dynChartType === 'pie' ? 'Giá trị' : 'Trục Y (Value)'}
          </label>
          <select
            value={dynYAxis}
            onChange={(e) => onDynYAxis(e.target.value as DynYAxis)}
            className="block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-purple-500 focus:ring-purple-500"
          >
            {DYN_Y_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative h-[460px] rounded-xl bg-white" ref={dynamicChartRef as Ref<HTMLDivElement>}>
        {dynamicChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {dynChartType === 'bar' ? (
              <BarChart
                data={dynamicChartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val) =>
                    dynYAxis === 'budget' ? new Intl.NumberFormat('vi-VN').format(val) : String(val)
                  }
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(v) => formatTooltipDynamic(v, dynYAxis, yLabel)}
                />
                <Bar dataKey="value" name={yLabel} radius={[6, 6, 0, 0]}>
                  {dynamicChartData.map((_, index) => (
                    <Cell key={`c-${index}`} fill={BAR_COLOR_ROTATION[index % BAR_COLOR_ROTATION.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : dynChartType === 'line' ? (
              <LineChart data={dynamicChartData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val) =>
                    dynYAxis === 'budget' ? new Intl.NumberFormat('vi-VN').format(val) : String(val)
                  }
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(v) => formatTooltipDynamic(v, dynYAxis, yLabel)}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#9333ea"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#9333ea', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0, stroke: '#fff' }}
                  name={yLabel}
                />
              </LineChart>
            ) : (
              <PieChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <Pie
                  data={dynamicChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={150}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {dynamicChartData.map((_, index) => (
                    <Cell key={`p-${index}`} fill={BAR_COLOR_ROTATION[index % BAR_COLOR_ROTATION.length]} />
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
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            )}
          </ResponsiveContainer>
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
  );
}
