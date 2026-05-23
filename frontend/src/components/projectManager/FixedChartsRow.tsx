import { type RefObject, type Ref } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { exportChartToExcel } from './exportChartToExcel.js';
import { formatTooltipBudgetTriệu } from './chartTooltipFormat.js';
import { getStatusColor, type DepartmentDatum, type StatusDatum } from './projectAnalytics.js';

export type FixedChartsRowProps = {
  statusData: StatusDatum[];
  departmentData: DepartmentDatum[];
  statusChartRef: RefObject<HTMLDivElement | null>;
  departmentChartRef: RefObject<HTMLDivElement | null>;
  onExpandStatus: () => void;
  onExpandDepartment: () => void;
};

export function FixedChartsRow({
  statusData,
  departmentData,
  statusChartRef,
  departmentChartRef,
  onExpandStatus,
  onExpandDepartment,
}: FixedChartsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <h3 className="flex items-center text-lg font-bold text-slate-800">
            <span className="mr-2 h-6 w-1.5 rounded-full bg-blue-600" />
            Trạng thái đề tài
          </h3>
          <div className="flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={onExpandStatus}
              className="rounded-lg bg-slate-50 p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
              title="Phóng to"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  chartRef: statusChartRef,
                  data: statusData,
                  columns: [
                    { header: 'Trạng thái', key: 'name', width: 30 },
                    { header: 'Số lượng', key: 'value', width: 15 },
                  ],
                  filename: 'Thong_ke_trang_thai',
                  sheetName: 'Trạng thái',
                })
              }
              className="rounded-lg bg-slate-50 p-1.5 text-slate-400 transition-colors hover:bg-green-50 hover:text-green-600"
              title="Xuất Excel"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="h-80 bg-white" ref={statusChartRef as Ref<HTMLDivElement>}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="group relative rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-start justify-between">
          <h3 className="flex items-center text-xl font-bold text-slate-800">
            <span className="mr-2 h-6 w-1.5 rounded-full bg-emerald-600" />
            Kinh phí theo Đơn vị (Triệu VNĐ)
          </h3>
          <div className="flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={onExpandDepartment}
              className="rounded-lg bg-slate-50 p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
              title="Phóng to"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  chartRef: departmentChartRef,
                  data: departmentData,
                  columns: [
                    { header: 'Đơn vị', key: 'name', width: 40 },
                    { header: 'Số đề tài', key: 'count', width: 15 },
                    { header: 'Kinh phí (Triệu VNĐ)', key: 'budget', width: 25 },
                  ],
                  filename: 'Thong_ke_kinh_phi',
                  sheetName: 'Kinh phí',
                })
              }
              className="rounded-lg bg-slate-50 p-1.5 text-slate-400 transition-colors hover:bg-green-50 hover:text-green-600"
              title="Xuất Excel"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="h-96 bg-white" ref={departmentChartRef as Ref<HTMLDivElement>}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={departmentData}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical horizontal />
              <XAxis
                type="number"
                dataKey="budget"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 13, fill: '#64748b' }}
                tickFormatter={(val) => new Intl.NumberFormat('vi-VN').format(val)}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#475569', textAnchor: 'end' }}
                width={160}
                tickMargin={12}
              />
              <Tooltip
                cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}
                formatter={formatTooltipBudgetTriệu}
                offset={24}
                allowEscapeViewBox={{ x: true, y: true }}
              />
              <Bar dataKey="budget" radius={[0, 8, 8, 0]} name="Kinh phí">
                {departmentData.map((entry, index) => {
                  const maxBudget = departmentData[0]?.budget || 1;
                  const intensity = Math.max(0, entry.budget / maxBudget);
                  return <Cell key={`cell-${index}`} fill={`rgba(37, 99, 235, ${0.4 + 0.6 * intensity})`} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
