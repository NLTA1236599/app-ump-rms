import { useMemo, useRef, useState } from 'react';
import { ChartFullscreenModal, type ExpandedChartKind } from './ChartFullscreenModal.js';
import { DynamicStatisticChart } from './DynamicStatisticChart.js';
import { GlobalFilterBar } from './GlobalFilterBar.js';
import { OverviewDonutCharts } from './OverviewDonutCharts.js';
import {
  buildDepartmentBudgetTop5,
  buildDynamicChartData,
  buildProjectTypeData,
  buildStats,
  filterProjects,
  filterProjectsByYear,
  getChartYears,
} from './projectAnalytics.js';
import { StatsRow } from './StatsRow.js';
import type { DynChartType, DynYAxis, ResearchProject } from './types.js';

/** Equal spacing between overview sections (~8px). */
const SECTION_GAP = 'gap-2';

export type ProjectOverviewViewProps = {
  projects: ResearchProject[];
  chatHandler?: (query: string, projects: ResearchProject[]) => Promise<string>;
  onViewProject?: (projectId: string) => void;
  onOpenDataTable?: () => void;
};

/** Tổng quan đề tài — filter bar, KPI cards, donuts, biểu đồ thống kê. */
export function ProjectOverviewView({ projects }: ProjectOverviewViewProps) {
  const [startYear, setStartYear] = useState('all');
  const [academicYear, setAcademicYear] = useState('all');
  const [status, setStatus] = useState('all');
  const [researchField, setResearchField] = useState('all');
  const [projectType, setProjectType] = useState('all');
  const [department, setDepartment] = useState('all');

  const [dynChartType, setDynChartType] = useState<DynChartType>('bar');
  const [dynXAxis, setDynXAxis] = useState('department');
  const [dynYAxis, setDynYAxis] = useState<DynYAxis>('count');
  const [dynChartYear, setDynChartYear] = useState('all');

  const [expandedChart, setExpandedChart] = useState<ExpandedChartKind>(null);

  const projectTypeChartRef = useRef<HTMLDivElement>(null);
  const departmentChartRef = useRef<HTMLDivElement>(null);
  const dynamicChartRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      filterProjects(projects, {
        startYear,
        academicYear,
        status,
        researchField,
        projectType,
        department,
      }),
    [projects, startYear, academicYear, status, researchField, projectType, department],
  );

  const chartYears = useMemo(() => getChartYears(projects), [projects]);
  const projectTypeData = useMemo(() => buildProjectTypeData(filtered), [filtered]);
  const departmentBudgetData = useMemo(() => buildDepartmentBudgetTop5(filtered), [filtered]);
  const chartFiltered = useMemo(
    () => filterProjectsByYear(filtered, dynChartYear),
    [filtered, dynChartYear],
  );
  const dynamicChartData = useMemo(
    () => buildDynamicChartData(chartFiltered, dynXAxis, dynYAxis),
    [chartFiltered, dynXAxis, dynYAxis],
  );
  const stats = useMemo(() => buildStats(filtered), [filtered]);

  const resetFilters = () => {
    setStartYear('all');
    setAcademicYear('all');
    setStatus('all');
    setResearchField('all');
    setProjectType('all');
    setDepartment('all');
  };

  return (
    <div className="relative animate-fadeIn pb-3">
      <GlobalFilterBar
        projects={projects}
        filteredCount={filtered.length}
        startYear={startYear}
        academicYear={academicYear}
        status={status}
        researchField={researchField}
        projectType={projectType}
        department={department}
        onStartYear={setStartYear}
        onAcademicYear={setAcademicYear}
        onStatus={setStatus}
        onResearchField={setResearchField}
        onProjectType={setProjectType}
        onDepartment={setDepartment}
        onReset={resetFilters}
      />

      <div className={`flex flex-col ${SECTION_GAP}`}>
        <StatsRow stats={stats} />

        <OverviewDonutCharts
          projectTypeData={projectTypeData}
          departmentBudgetData={departmentBudgetData}
          projectTypeChartRef={projectTypeChartRef}
          departmentChartRef={departmentChartRef}
          onExpandProjectType={() => setExpandedChart('projectType')}
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

      <ChartFullscreenModal
        expanded={expandedChart}
        onClose={() => setExpandedChart(null)}
        projectTypeData={projectTypeData}
        departmentDonutData={departmentBudgetData}
        dynamicChartData={dynamicChartData}
        dynChartType={dynChartType}
        dynYAxis={dynYAxis}
      />
    </div>
  );
}
