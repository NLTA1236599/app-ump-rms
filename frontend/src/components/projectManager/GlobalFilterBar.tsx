import type { ResearchProject } from './types.js';
import { extractYearFromDate, getProjectTypeOptions } from './projectAnalytics.js';

export type GlobalFilterBarProps = {
  projects: ResearchProject[];
  filteredCount: number;
  startYear: string;
  academicYear: string;
  status: string;
  researchField: string;
  projectType: string;
  department: string;
  onStartYear: (v: string) => void;
  onAcademicYear: (v: string) => void;
  onStatus: (v: string) => void;
  onResearchField: (v: string) => void;
  onProjectType: (v: string) => void;
  onDepartment: (v: string) => void;
  onReset: () => void;
};

function sortAcademicYearsDesc(years: string[]): string[] {
  return [...years].sort((a, b) => {
    const yearA = Number.parseInt(a, 10);
    const yearB = Number.parseInt(b, 10);
    if (!Number.isNaN(yearA) && !Number.isNaN(yearB) && yearA !== yearB) {
      return yearB - yearA;
    }
    return b.localeCompare(a, 'vi');
  });
}

const selectClass =
  'flex min-w-[6.25rem] items-center gap-0.5 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] text-slate-600 outline-none transition hover:border-blue-400 focus:border-[#1a6ec2] focus:ring-1 focus:ring-[#1a6ec2]';

export function GlobalFilterBar({
  projects,
  filteredCount,
  startYear,
  academicYear,
  status,
  researchField,
  projectType,
  department,
  onStartYear,
  onAcademicYear,
  onStatus,
  onResearchField,
  onProjectType,
  onDepartment,
  onReset,
}: GlobalFilterBarProps) {
  const years = Array.from(
    new Set(
      projects
        .map((p) => (p.startDate ? extractYearFromDate(p.startDate) : null))
        .filter((y): y is string => Boolean(y)),
    ),
  ).sort((a, b) => Number(b) - Number(a));

  const academicYears = sortAcademicYearsDesc(
    Array.from(
      new Set(
        projects
          .map((p) => p.acceptanceAcademicYear?.trim())
          .filter((y): y is string => Boolean(y)),
      ),
    ),
  );

  const departments = Array.from(new Set(projects.map((p) => p.department)))
    .filter(Boolean)
    .sort();
  const statuses = Array.from(new Set(projects.map((p) => p.status)))
    .filter(Boolean)
    .sort();
  const fields = Array.from(new Set(projects.map((p) => p.researchField)))
    .filter(Boolean)
    .sort();
  const projectTypes = getProjectTypeOptions(projects);

  return (
    <div className="sticky top-0 z-30 -mx-3 mb-2 border-b border-slate-200 bg-[#f0f4f8] px-3 py-1.5 md:-mx-4 md:px-4">
      <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <h2 className="mr-1 shrink-0 text-[11px] font-semibold text-slate-700">
            Tổng quan Dashboard
          </h2>
          <span className="rounded-full bg-[#1a6ec2]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#1a6ec2]">
            {filteredCount}/{projects.length} đề tài
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <select
            className={selectClass}
            value={academicYear}
            onChange={(e) => onAcademicYear(e.target.value)}
            aria-label="Năm học"
          >
            <option value="all">Năm học</option>
            {academicYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={department}
            onChange={(e) => onDepartment(e.target.value)}
            aria-label="Đơn vị"
          >
            <option value="all">Đơn vị</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={status}
            onChange={(e) => onStatus(e.target.value)}
            aria-label="Trạng thái"
          >
            <option value="all">Trạng thái</option>
            {statuses.map((s) => (
              <option key={String(s)} value={String(s)}>
                {String(s)}
              </option>
            ))}
          </select>

          <select
            className={`${selectClass} min-w-[6.5rem]`}
            value={researchField}
            onChange={(e) => onResearchField(e.target.value)}
            aria-label="Lĩnh vực"
          >
            <option value="all">Lĩnh vực</option>
            {fields.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={startYear}
            onChange={(e) => onStartYear(e.target.value)}
            aria-label="Năm bắt đầu"
          >
            <option value="all">Năm bắt đầu</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={projectType}
            onChange={(e) => onProjectType(e.target.value)}
            aria-label="Loại đề tài"
          >
            <option value="all">Loại đề tài</option>
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onReset}
            className="text-[10px] text-slate-400 underline transition-colors hover:text-red-500"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      </div>
    </div>
  );
}
