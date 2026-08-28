import { useMemo, useRef, useState } from 'react';
import { ChartFullscreenModal, type ExpandedChartKind } from './ChartFullscreenModal.js';
import { DynamicStatisticChart } from './DynamicStatisticChart.js';
import { GlobalFilterBar } from './GlobalFilterBar.js';
import { OverviewDonutCharts } from './OverviewDonutCharts.js';
import {
  buildDepartmentBudgetTop5,
  buildDynamicChartData,
  buildProjectTypeData,
  buildStackedChartData,
  buildStats,
  filterProjects,
  filterProjectsByYear,
  getChartYears,
} from './projectAnalytics.js';
import { StatsRow } from './StatsRow.js';
import type { DynChartType, DynStackBy, DynYAxis, ResearchProject } from './types.js';

/** Equal spacing between overview sections. */
const SECTION_GAP = 'gap-1.5';

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
  const [acceptanceYear, setAcceptanceYear] = useState('all');
  const [status, setStatus] = useState('all');
  const [researchField, setResearchField] = useState('all');
  const [projectType, setProjectType] = useState('all');
  const [department, setDepartment] = useState('all');
  const [reviewBatch, setReviewBatch] = useState('all');

  const [dynChartType, setDynChartType] = useState<DynChartType>('bar');
  const [dynXAxis, setDynXAxis] = useState('department');
  const [dynYAxis, setDynYAxis] = useState<DynYAxis>('count');
  const [dynStackBy, setDynStackBy] = useState<DynStackBy>('status');
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
        acceptanceYear,
        status,
        researchField,
        projectType,
        department,
        reviewBatch,
      }),
    [projects, startYear, academicYear, acceptanceYear, status, researchField, projectType, department, reviewBatch],
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
  const stackedChartData = useMemo(
    () => buildStackedChartData(chartFiltered, dynXAxis, dynYAxis, dynStackBy),
    [chartFiltered, dynXAxis, dynYAxis, dynStackBy],
  );
  const stats = useMemo(() => buildStats(filtered), [filtered]);

  const resetFilters = () => {
    setStartYear('all');
    setAcademicYear('all');
    setAcceptanceYear('all');
    setStatus('all');
    setResearchField('all');
    setProjectType('all');
    setDepartment('all');
    setReviewBatch('all');
  };

  return (
    <div className="relative animate-fadeIn pb-2">
      <GlobalFilterBar
        projects={projects}
        filteredCount={filtered.length}
        startYear={startYear}
        academicYear={academicYear}
        acceptanceYear={acceptanceYear}
        status={status}
        researchField={researchField}
        projectType={projectType}
        department={department}
        reviewBatch={reviewBatch}
        onStartYear={setStartYear}
        onAcademicYear={setAcademicYear}
        onAcceptanceYear={setAcceptanceYear}
        onStatus={setStatus}
        onResearchField={setResearchField}
        onProjectType={setProjectType}
        onDepartment={setDepartment}
        onReviewBatch={setReviewBatch}
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
          stackedChartData={stackedChartData}
          availableYears={chartYears}
          dynChartType={dynChartType}
          dynXAxis={dynXAxis}
          dynYAxis={dynYAxis}
          dynStackBy={dynStackBy}
          dynChartYear={dynChartYear}
          onDynChartType={setDynChartType}
          onDynXAxis={setDynXAxis}
          onDynYAxis={setDynYAxis}
          onDynStackBy={setDynStackBy}
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
        stackedChartData={stackedChartData}
        dynChartType={dynChartType}
        dynYAxis={dynYAxis}
        dynXAxis={dynXAxis}
        dynStackBy={dynStackBy}
        dynChartYear={dynChartYear}
      />
    </div>
  );
}
