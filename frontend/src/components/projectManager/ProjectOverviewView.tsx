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
  filterProjectsByYear,
  getChartYears,
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
  const [projectType, setProjectType] = useState('all');
  const [department, setDepartment] = useState('all');

  const [dynChartType, setDynChartType] = useState<DynChartType>('bar');
  const [dynXAxis, setDynXAxis] = useState('department');
  const [dynYAxis, setDynYAxis] = useState<DynYAxis>('count');
  const [dynChartYear, setDynChartYear] = useState('all');

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
        projectType,
        department,
      }),
    [projects, startYear, status, researchField, projectType, department]
  );

  const chartYears = useMemo(() => getChartYears(projects), [projects]);

  const statusData = useMemo(() => buildStatusData(filtered), [filtered]);
  const departmentData = useMemo(() => buildDepartmentData(filtered), [filtered]);
  const chartFiltered = useMemo(
    () => filterProjectsByYear(filtered, dynChartYear),
    [filtered, dynChartYear],
  );
  const dynamicChartData = useMemo(
    () => buildDynamicChartData(chartFiltered, dynXAxis, dynYAxis),
    [chartFiltered, dynXAxis, dynYAxis],
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
            availableYears={chartYears}
            dynChartType={dynChartType}
            dynXAxis={dynXAxis}
            dynYAxis={dynYAxis}
            dynChartYear={dynChartYear}
            onDynChartType={setDynChartType}
            onDynXAxis={setDynXAxis}
            onDynYAxis={setDynYAxis}
            onDynChartYear={setDynChartYear}
            onExpand={() => setExpandedChart('dynamic')}
          />
        </div>

        <DataFilterSidebar
          projects={projects}
          filteredCount={filtered.length}
          startYear={startYear}
          status={status}
          researchField={researchField}
          projectType={projectType}
          department={department}
          onStartYear={setStartYear}
          onStatus={setStatus}
          onResearchField={setResearchField}
          onProjectType={setProjectType}
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
