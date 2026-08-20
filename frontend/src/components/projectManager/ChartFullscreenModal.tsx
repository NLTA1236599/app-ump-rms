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

function FullscreenPie({
  data,
  colors,
  tooltipFormatter,
}: {
  data: { name: string; value: number }[];
  colors: readonly string[];
  tooltipFormatter?: (value: unknown, name: unknown) => [string | number, string];
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 md:flex-row md:items-center">
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={PIE_INNER_PCT}
              outerRadius={PIE_OUTER_PCT}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
            >
              {data.map((_, index) => (
                <Cell key={`fs-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={tooltipFormatter}
              contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ChartLegendList
        items={data.map((d, index) => ({
          name: d.name,
          color: colors[index % colors.length],
          detail: String(d.value),
        }))}
        className="max-h-24 shrink-0 overflow-y-auto px-1 md:max-h-full md:w-[260px] md:flex-col md:flex-nowrap"
      />
    </div>
  );
}

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
      className="fixed inset-0 z-[100] flex animate-fadeIn items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm sm:p-6 md:p-8"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ height: 'min(88vh, 40rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="flex items-center text-lg font-bold text-slate-800 sm:text-xl">
            {expanded === 'projectType' ? (
              <>
                <span className="mr-3 h-7 w-1.5 rounded-full bg-[#1a6ec2]" /> Phân bổ theo Loại đề tài
              </>
            ) : expanded === 'department' ? (
              <>
                <span className="mr-3 h-7 w-1.5 rounded-full bg-[#1558a8]" /> Kinh phí theo Đơn vị (Top 5)
              </>
            ) : (
              <>
                <span className="mr-3 h-7 w-1.5 rounded-full bg-purple-600" /> Biểu đồ Thống kê
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
        <div className="min-h-0 flex-1 overflow-hidden p-3 sm:p-5">
          {expanded === 'projectType' ? (
            <FullscreenPie data={projectTypeData} colors={DONUT_TYPE_COLORS} />
          ) : null}
          {expanded === 'department' ? (
            <FullscreenPie
              data={departmentDonutData}
              colors={DONUT_BUDGET_COLORS}
              tooltipFormatter={(value) => [`${value ?? 0} triệu VNĐ`, 'Kinh phí']}
            />
          ) : null}
          {expanded === 'dynamic' ? (
            dynChartType === 'pie' ? (
              <FullscreenPie
                data={dynamicChartData}
                colors={BAR_COLOR_ROTATION}
                tooltipFormatter={(v) => formatTooltipDynamic(v, dynYAxis, yLabel)}
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {dynChartType === 'bar' ? (
                  <BarChart
                    data={dynamicChartData}
                    margin={{ top: 24, right: 24, left: 8, bottom: 48 }}
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
                      height={56}
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
                ) : (
                  <LineChart data={dynamicChartData} margin={{ top: 24, right: 24, left: 8, bottom: 48 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      angle={-25}
                      textAnchor="end"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 13, fill: '#64748b' }}
                      height={56}
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
                )}
              </ResponsiveContainer>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
