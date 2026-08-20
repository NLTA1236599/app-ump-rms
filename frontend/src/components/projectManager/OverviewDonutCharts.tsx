import { type Ref, type RefObject } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { ChartLegendList } from './ChartLegendList.js';
import { PIE_INNER_PCT, PIE_OUTER_PCT } from './chartPieLayout.js';
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
      <div className={`flex items-center justify-between px-2 py-1 ${titleBarClass}`}>
        <h3 className="text-[11px] font-bold text-white">{title}</h3>
        <ChartActions onExpand={onExpand} onExport={onExport} />
      </div>
      <div className="flex flex-col gap-1.5 p-1.5 sm:flex-row sm:items-center">
        <div
          className="flex min-w-0 flex-1 flex-col items-center"
          ref={chartRef as Ref<HTMLDivElement>}
        >
          {data.length > 0 ? (
            <>
              <div className="relative mx-auto w-full max-w-[148px]" style={{ aspectRatio: '1 / 1' }}>
                <div className="absolute inset-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={PIE_INNER_PCT}
                        outerRadius={PIE_OUTER_PCT}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {data.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => {
                          const num = Number(value) || 0;
                          const pct = total > 0 ? ((num / total) * 100).toFixed(1) : '0';
                          return [`${num} ${valueSuffix} (${pct}%)`, String(name ?? '')];
                        }}
                        contentStyle={{ borderRadius: '6px', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <p className="mt-1 max-w-full px-1 text-center text-[11px] font-semibold leading-tight text-slate-700">
                {centerLabel}
              </p>
            </>
          ) : (
            <div className="flex h-[120px] items-center justify-center text-sm text-slate-400">
              Chưa có dữ liệu
            </div>
          )}
        </div>
        {data.length > 0 ? (
          <ChartLegendList
            items={data.map((d, index) => ({
              name: d.name,
              color: colors[index % colors.length],
              detail: String(d.value),
            }))}
            className="max-h-[120px] overflow-y-auto px-1 sm:max-h-[168px] sm:w-[42%] sm:flex-col sm:flex-nowrap"
          />
        ) : null}
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
    <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-2">
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
