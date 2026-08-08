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
  DONUT_BUDGET_COLORS,
  DONUT_TYPE_COLORS,
  type DonutDatum,
  type DynamicDatum,
} from './projectAnalytics.js';
import type { DynChartType, DynYAxis } from './types.js';
import { formatTooltipDynamic } from './chartTooltipFormat.js';

export type ExpandedChartKind = 'projectType' | 'department' | 'dynamic' | null;

export type ChartFullscreenModalProps = {
  expanded: ExpandedChartKind;
  onClose: () => void;
  projectTypeData: DonutDatum[];
  departmentDonutData: DonutDatum[];
  dynamicChartData: DynamicDatum[];
  dynChartType: DynChartType;
  dynYAxis: DynYAxis;
};

export function ChartFullscreenModal({
  expanded,
  onClose,
  projectTypeData,
  departmentDonutData,
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
            {expanded === 'projectType' ? (
              <>
                <span className="mr-3 h-8 w-2 rounded-full bg-[#1a6ec2]" /> Phân bổ theo Loại đề tài
              </>
            ) : expanded === 'department' ? (
              <>
                <span className="mr-3 h-8 w-2 rounded-full bg-[#1558a8]" /> Kinh phí theo Đơn vị (Top 5)
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
          {expanded === 'projectType' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={120}
                  outerRadius={200}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {projectTypeData.map((_, index) => (
                    <Cell key={`fs-pt-${index}`} fill={DONUT_TYPE_COLORS[index % DONUT_TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend verticalAlign="bottom" height={40} wrapperStyle={{ fontSize: '14px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : null}
          {expanded === 'department' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={120}
                  outerRadius={200}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {departmentDonutData.map((_, index) => (
                    <Cell
                      key={`fs-dep-${index}`}
                      fill={DONUT_BUDGET_COLORS[index % DONUT_BUDGET_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value ?? 0} triệu VNĐ`, 'Kinh phí']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={40} wrapperStyle={{ fontSize: '14px' }} />
              </PieChart>
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
                    formatter={(v) => formatTooltipDynamic(v, dynYAxis, yLabel)}
                    contentStyle={{ borderRadius: '12px', border: 'none' }}
                  />
                  <Bar dataKey="value" name={yLabel} radius={[6, 6, 0, 0]}>
                    {dynamicChartData.map((_, index) => (
                      <Cell key={`c-${index}`} fill={BAR_COLOR_ROTATION[index % BAR_COLOR_ROTATION.length]} />
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
                    formatter={(v) => formatTooltipDynamic(v, dynYAxis, yLabel)}
                    contentStyle={{ borderRadius: '12px', border: 'none' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#9333ea"
                    strokeWidth={3}
                    name={yLabel}
                  />
                </LineChart>
              ) : (
                <PieChart>
                  <Pie
                    data={dynamicChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={120}
                    outerRadius={200}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {dynamicChartData.map((_, index) => (
                      <Cell key={`p-${index}`} fill={BAR_COLOR_ROTATION[index % BAR_COLOR_ROTATION.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatTooltipDynamic(v, dynYAxis, yLabel)}
                    contentStyle={{ borderRadius: '12px', border: 'none' }}
                  />
                  <Legend verticalAlign="bottom" height={40} />
                </PieChart>
              )}
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>
    </div>
  );
}
