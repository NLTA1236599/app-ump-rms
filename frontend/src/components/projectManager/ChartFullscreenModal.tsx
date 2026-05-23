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
import {
  BAR_COLOR_ROTATION,
  type DepartmentDatum,
  type DynamicDatum,
  getStatusColor,
  type StatusDatum,
} from './projectAnalytics.js';
import type { DynChartType, DynYAxis } from './types.js';
import { formatTooltipBudgetTriệu, formatTooltipDynamic } from './chartTooltipFormat.js';

export type ExpandedChartKind = 'status' | 'department' | 'dynamic' | null;

export type ChartFullscreenModalProps = {
  expanded: ExpandedChartKind;
  onClose: () => void;
  statusData: StatusDatum[];
  departmentData: DepartmentDatum[];
  dynamicChartData: DynamicDatum[];
  dynChartType: DynChartType;
  dynYAxis: DynYAxis;
};

export function ChartFullscreenModal({
  expanded,
  onClose,
  statusData,
  departmentData,
  dynamicChartData,
  dynChartType,
  dynYAxis,
}: ChartFullscreenModalProps) {
  if (!expanded) return null;

  const yLabel = dynYAxis === 'budget' ? 'Kinh phí' : 'Số lượng';

  return (
    <div
      className="fixed inset-0 z-[100] flex animate-fadeIn items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm md:p-10"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="flex items-center text-2xl font-bold text-slate-800">
            {expanded === 'status' ? (
              <>
                <span className="mr-3 h-8 w-2 rounded-full bg-blue-600" /> Trạng thái đề tài
              </>
            ) : expanded === 'department' ? (
              <>
                <span className="mr-3 h-8 w-2 rounded-full bg-emerald-600" /> Kinh phí theo Đơn vị (Triệu VNĐ)
              </>
            ) : (
              <>
                <span className="mr-3 h-8 w-2 rounded-full bg-purple-600" /> Biểu đồ Thống kê
              </>
            )}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
            title="Đóng"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 p-8">
          {expanded === 'status' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={120}
                  outerRadius={200}
                  paddingAngle={8}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`fs-${index}`} fill={getStatusColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={40} wrapperStyle={{ fontSize: '14px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : null}
          {expanded === 'department' ? (
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
                  tick={{ fontSize: 14, fill: '#64748b' }}
                  tickFormatter={(val) => new Intl.NumberFormat('vi-VN').format(val)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={200}
                  tick={{ fontSize: 14, fill: '#475569', textAnchor: 'end' }}
                  tickMargin={16}
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
                    return <Cell key={`fb-${index}`} fill={`rgba(37, 99, 235, ${0.4 + 0.6 * intensity})`} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : null}
          {expanded === 'dynamic' ? (
            <ResponsiveContainer width="100%" height="100%">
              {dynChartType === 'bar' ? (
                <BarChart
                  data={dynamicChartData}
                  margin={{ top: 40, right: 30, left: 10, bottom: 60 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    angle={-25}
                    textAnchor="end"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 13, fill: '#64748b' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 14, fill: '#64748b' }}
                    tickFormatter={(val) =>
                      dynYAxis === 'budget' ? new Intl.NumberFormat('vi-VN').format(val) : String(val)
                    }
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }}
                    formatter={(v) => formatTooltipDynamic(v, dynYAxis, yLabel)}
                  />
                  <Bar dataKey="value" name={yLabel} radius={[8, 8, 0, 0]}>
                    {dynamicChartData.map((_, index) => (
                      <Cell key={`db-${index}`} fill={BAR_COLOR_ROTATION[index % BAR_COLOR_ROTATION.length]} />
                    ))}
                  </Bar>
                </BarChart>
              ) : dynChartType === 'line' ? (
                <LineChart data={dynamicChartData} margin={{ top: 40, right: 30, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    angle={-25}
                    textAnchor="end"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 13, fill: '#64748b' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 14, fill: '#64748b' }}
                    tickFormatter={(val) =>
                      dynYAxis === 'budget' ? new Intl.NumberFormat('vi-VN').format(val) : String(val)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }}
                    formatter={(v) => formatTooltipDynamic(v, dynYAxis, yLabel)}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#9333ea"
                    strokeWidth={4}
                    dot={{ r: 6, fill: '#9333ea', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0, stroke: '#fff' }}
                    name={yLabel}
                  />
                </LineChart>
              ) : (
                <PieChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <Pie
                    data={dynamicChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={130}
                    outerRadius={220}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {dynamicChartData.map((_, index) => (
                      <Cell key={`dp-${index}`} fill={BAR_COLOR_ROTATION[index % BAR_COLOR_ROTATION.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }}
                    formatter={(v) => formatTooltipDynamic(v, dynYAxis, yLabel)}
                  />
                  <Legend verticalAlign="bottom" height={40} wrapperStyle={{ fontSize: '14px' }} />
                </PieChart>
              )}
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>
    </div>
  );
}
