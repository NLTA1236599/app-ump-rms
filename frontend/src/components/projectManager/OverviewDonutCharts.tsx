import { type Ref, type RefObject } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { exportChartToExcel } from './exportChartToExcel.js';
import {
  DONUT_BUDGET_COLORS,
  DONUT_TYPE_COLORS,
  type DonutDatum,
} from './projectAnalytics.js';

export type OverviewDonutChartsProps = {
  projectTypeData: DonutDatum[];
  departmentBudgetData: DonutDatum[];
  projectTypeChartRef: RefObject<HTMLDivElement | null>;
  departmentChartRef: RefObject<HTMLDivElement | null>;
  onExpandProjectType: () => void;
  onExpandDepartment: () => void;
};

function ChartActions({
  onExpand,
  onExport,
}: {
  onExpand: () => void;
  onExport: () => void;
}) {
  return (
    <div className="flex space-x-0.5 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        type="button"
        onClick={onExpand}
        className="rounded bg-white/15 p-1 text-white/80 transition-colors hover:bg-white/25 hover:text-white"
        title="Phóng to"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        onClick={onExport}
        className="rounded bg-white/15 p-1 text-white/80 transition-colors hover:bg-white/25 hover:text-white"
        title="Xuất Excel"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </button>
    </div>
  );
}

function DonutCard({
  title,
  titleBarClass,
  data,
  colors,
  centerLabel,
  valueSuffix,
  chartRef,
  onExpand,
  onExport,
}: {
  title: string;
  titleBarClass: string;
  data: DonutDatum[];
  colors: string[];
  centerLabel: string;
  valueSuffix: string;
  chartRef: RefObject<HTMLDivElement | null>;
  onExpand: () => void;
  onExport: () => void;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className={`flex items-center justify-between px-2 py-1.5 ${titleBarClass}`}>
        <h3 className="text-[11px] font-bold text-white">{title}</h3>
        <ChartActions onExpand={onExpand} onExport={onExport} />
      </div>
      <div className="p-1.5">
        <div className="h-[110px] bg-white" ref={chartRef as Ref<HTMLDivElement>}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="40%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={44}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <text
                  x="40%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-700 text-[9px] font-bold"
                >
                  {centerLabel}
                </text>
                <Tooltip
                  formatter={(value, name) => {
                    const num = Number(value) || 0;
                    const pct = total > 0 ? ((num / total) * 100).toFixed(1) : '0';
                    return [`${num} ${valueSuffix} (${pct}%)`, String(name ?? '')];
                  }}
                  contentStyle={{ borderRadius: '6px', fontSize: '11px' }}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  iconSize={7}
                  formatter={(value) => <span className="text-[10px] text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function OverviewDonutCharts({
  projectTypeData,
  departmentBudgetData,
  projectTypeChartRef,
  departmentChartRef,
  onExpandProjectType,
  onExpandDepartment,
}: OverviewDonutChartsProps) {
  const typeTotal = projectTypeData.reduce((s, d) => s + d.value, 0);
  const budgetTotal = departmentBudgetData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      <DonutCard
        title="Phân bổ theo Loại đề tài"
        titleBarClass="bg-[#1a6ec2]"
        data={projectTypeData}
        colors={DONUT_TYPE_COLORS}
        centerLabel={`${typeTotal} đề tài`}
        valueSuffix="đề tài"
        chartRef={projectTypeChartRef}
        onExpand={onExpandProjectType}
        onExport={() =>
          void exportChartToExcel({
            chartRef: projectTypeChartRef,
            data: projectTypeData,
            columns: [
              { header: 'Loại đề tài', key: 'name', width: 30 },
              { header: 'Số lượng', key: 'value', width: 15 },
            ],
            filename: 'Thong_ke_loai_de_tai',
            sheetName: 'Loại đề tài',
          })
        }
      />
      <DonutCard
        title="Phân bổ Kinh phí theo Đơn vị (Top 5)"
        titleBarClass="bg-[#1558a8]"
        data={departmentBudgetData}
        colors={DONUT_BUDGET_COLORS}
        centerLabel={`Tổng: ${budgetTotal.toLocaleString('vi-VN')} triệu`}
        valueSuffix="triệu"
        chartRef={departmentChartRef}
        onExpand={onExpandDepartment}
        onExport={() =>
          void exportChartToExcel({
            chartRef: departmentChartRef,
            data: departmentBudgetData,
            columns: [
              { header: 'Đơn vị', key: 'name', width: 40 },
              { header: 'Kinh phí (Triệu VNĐ)', key: 'value', width: 25 },
            ],
            filename: 'Thong_ke_kinh_phi_don_vi',
            sheetName: 'Kinh phí',
          })
        }
      />
    </div>
  );
}
