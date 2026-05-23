import { useMemo, useRef, useState } from 'react';
import { ChartFullscreenModal, type ExpandedChartKind } from './ChartFullscreenModal.js';
import { DataFilterSidebar } from './DataFilterSidebar.js';
import { DynamicStatisticChart } from './DynamicStatisticChart.js';
import { FixedChartsRow } from './FixedChartsRow.js';
import {
  buildDepartmentData,
  buildDynamicChartData,
  buildStats,
  buildStatusData,
  filterProjects,
} from './projectAnalytics.js';
import { StatsRow } from './StatsRow.js';
import type { DynChartType, DynYAxis, ResearchProject } from './types.js';
import { VirtualAssistantFab } from './VirtualAssistantFab.js';

export type ProjectOverviewViewProps = {
  projects: ResearchProject[];
  chatHandler?: (query: string, projects: ResearchProject[]) => Promise<string>;
};

/** Tổng quan đề tài — thống kê, lọc, biểu đồ (sidebar item "Tổng quan"). */
export function ProjectOverviewView({ projects, chatHandler }: ProjectOverviewViewProps) {
  const [startYear, setStartYear] = useState('all');
  const [status, setStatus] = useState('all');
  const [researchField, setResearchField] = useState('all');
  const [department, setDepartment] = useState('all');

  const [dynChartType, setDynChartType] = useState<DynChartType>('bar');
  const [dynXAxis, setDynXAxis] = useState('department');
  const [dynYAxis, setDynYAxis] = useState<DynYAxis>('count');

  const [expandedChart, setExpandedChart] = useState<ExpandedChartKind>(null);

  const statusChartRef = useRef<HTMLDivElement>(null);
  const departmentChartRef = useRef<HTMLDivElement>(null);
  const dynamicChartRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      filterProjects(projects, {
        startYear,
        status,
        researchField,
        department,
      }),
    [projects, startYear, status, researchField, department]
  );

  const statusData = useMemo(() => buildStatusData(filtered), [filtered]);
  const departmentData = useMemo(() => buildDepartmentData(filtered), [filtered]);
  const dynamicChartData = useMemo(
    () => buildDynamicChartData(filtered, dynXAxis, dynYAxis),
    [filtered, dynXAxis, dynYAxis]
  );
  const stats = useMemo(() => buildStats(filtered), [filtered]);

  return (
    <div className="relative animate-fadeIn pb-24">
      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="min-w-0 flex-1 space-y-8">
          <StatsRow stats={stats} />
          <FixedChartsRow
            statusData={statusData}
            departmentData={departmentData}
            statusChartRef={statusChartRef}
            departmentChartRef={departmentChartRef}
            onExpandStatus={() => setExpandedChart('status')}
            onExpandDepartment={() => setExpandedChart('department')}
          />
          <DynamicStatisticChart
            dynamicChartRef={dynamicChartRef}
            dynamicChartData={dynamicChartData}
            dynChartType={dynChartType}
            dynXAxis={dynXAxis}
            dynYAxis={dynYAxis}
            onDynChartType={setDynChartType}
            onDynXAxis={setDynXAxis}
            onDynYAxis={setDynYAxis}
            onExpand={() => setExpandedChart('dynamic')}
          />
        </div>

        <DataFilterSidebar
          projects={projects}
          filteredCount={filtered.length}
          startYear={startYear}
          status={status}
          researchField={researchField}
          department={department}
          onStartYear={setStartYear}
          onStatus={setStatus}
          onResearchField={setResearchField}
          onDepartment={setDepartment}
        />
      </div>

      <VirtualAssistantFab projects={filtered} chatHandler={chatHandler} />

      <ChartFullscreenModal
        expanded={expandedChart}
        onClose={() => setExpandedChart(null)}
        statusData={statusData}
        departmentData={departmentData}
        dynamicChartData={dynamicChartData}
        dynChartType={dynChartType}
        dynYAxis={dynYAxis}
      />
    </div>
  );
}
