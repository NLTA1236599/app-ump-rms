import type { ResearchProject } from '../DataTable/types.js';

import { DuplicateProjectRow } from './DuplicateProjectRow.js';
import { ChevronDownIcon, ChevronRightIcon, DocumentDuplicateIcon } from './icons.js';
import type { DuplicateGroup } from './types.js';

type DuplicateGroupCardProps = {
  group: DuplicateGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onView: (project: ResearchProject) => void;
  onEdit: (project: ResearchProject) => void;
};

export function DuplicateGroupCard({
  group,
  isExpanded,
  onToggle,
  onView,
  onEdit,
}: DuplicateGroupCardProps) {
  const occurrenceText = `Xuất hiện: ${group.projects.length} lần trong ${group.years.length} năm`;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-violet-200 border-l-4 border-l-violet-400
                 bg-white shadow-sm transition-all duration-200"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between px-5 py-4
                   hover:bg-violet-50/30"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <DocumentDuplicateIcon className="h-5 w-5 flex-shrink-0 text-violet-500" />
          <div className="min-w-0 flex-1 text-left">
            <p className="line-clamp-2 text-sm font-semibold text-slate-800">
              {group.representativeTitle}
            </p>
            <p className="mt-1 text-xs text-slate-400">{occurrenceText}</p>
          </div>
        </div>

        <div className="ml-3 flex flex-shrink-0 items-center gap-2">
          {group.years.map((year) => (
            <span
              key={year}
              className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700"
            >
              {year}
            </span>
          ))}
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="bg-violet-50/50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-4 py-2 text-left">Năm</th>
                <th className="px-4 py-2 text-left">Số HĐ</th>
                <th className="px-4 py-2 text-left">Chủ nhiệm</th>
                <th className="px-4 py-2 text-left">Khoa/Đơn vị</th>
                <th className="px-4 py-2 text-left">Tình trạng</th>
                <th className="px-4 py-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {group.projects.map((project) => (
                <DuplicateProjectRow
                  key={project.id}
                  project={project}
                  groupYears={group.years}
                  onView={onView}
                  onEdit={onEdit}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
