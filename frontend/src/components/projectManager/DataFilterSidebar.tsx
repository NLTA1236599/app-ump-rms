import type { ResearchProject } from './types.js';
import { extractYearFromDate, getProjectTypeOptions } from './projectAnalytics.js';

export type FilterSidebarProps = {
  projects: ResearchProject[];
  filteredCount: number;
  startYear: string;
  status: string;
  researchField: string;
  projectType: string;
  department: string;
  onStartYear: (v: string) => void;
  onStatus: (v: string) => void;
  onResearchField: (v: string) => void;
  onProjectType: (v: string) => void;
  onDepartment: (v: string) => void;
};

export function DataFilterSidebar({
  projects,
  filteredCount,
  startYear,
  status,
  researchField,
  projectType,
  department,
  onStartYear,
  onStatus,
  onResearchField,
  onProjectType,
  onDepartment,
}: FilterSidebarProps) {
  const years = Array.from(
    new Set(
      projects
        .map((p) => (p.startDate ? extractYearFromDate(p.startDate) : null))
        .filter((y): y is string => Boolean(y))
    )
  ).sort((a, b) => Number(b) - Number(a));

  const departments = Array.from(new Set(projects.map((p) => p.department))).filter(Boolean).sort();
  const statuses = Array.from(new Set(projects.map((p) => p.status))).filter(Boolean).sort();
  const fields = Array.from(new Set(projects.map((p) => p.researchField))).filter(Boolean).sort();
  const projectTypes = getProjectTypeOptions(projects);

  return (
    <div className="w-full shrink-0 xl:w-80">
      <div className="sticky top-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="flex items-center text-lg font-bold text-slate-800">
            <span className="mr-2 h-6 w-1.5 rounded-full bg-chrome-primary" />
            Bộ Lọc Dữ Liệu
          </h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <svg className="mr-2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Năm bắt đầu
            </label>
            <select
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-blue-500"
              value={startYear}
              onChange={(e) => onStartYear(e.target.value)}
            >
              <option value="all">Tất cả các năm bắt đầu</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <svg className="mr-2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Trạng thái
            </label>
            <select
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-blue-500"
              value={status}
              onChange={(e) => onStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              {statuses.map((s) => (
                <option key={String(s)} value={String(s)}>
                  {String(s)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <svg className="mr-2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Lĩnh vực
            </label>
            <select
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-blue-500"
              value={researchField}
              onChange={(e) => onResearchField(e.target.value)}
            >
              <option value="all">Tất cả lĩnh vực</option>
              {fields.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <svg className="mr-2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Loại đề tài
            </label>
            <select
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-blue-500"
              value={projectType}
              onChange={(e) => onProjectType(e.target.value)}
            >
              <option value="all">Tất cả loại đề tài</option>
              {projectTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <svg className="mr-2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Đơn vị
            </label>
            <select
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-blue-500"
              value={department}
              onChange={(e) => onDepartment(e.target.value)}
            >
              <option value="all">Tất cả đơn vị</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="w-full rounded-xl bg-chrome-primary py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            Tổng số đề tài: {filteredCount}/{projects.length} đề tài
          </button>

          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-start rounded-xl bg-blue-50 p-3">
              <svg
                className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs font-medium text-blue-700">
                Đang hiển thị {filteredCount}/{projects.length} đề tài.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
