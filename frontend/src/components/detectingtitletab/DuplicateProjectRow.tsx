import { EyeIcon, PencilIcon } from '../DataTable/icons.js';
import { getStatusBadge } from '../DataTable/badges.js';
import type { ResearchProject } from '../DataTable/types.js';

import { getProjectYear } from './extractYear.js';

type DuplicateProjectRowProps = {
  project: ResearchProject;
  groupYears: number[];
  onView: (project: ResearchProject) => void;
  onEdit: (project: ResearchProject) => void;
};

export function DuplicateProjectRow({
  project,
  groupYears,
  onView,
  onEdit,
}: DuplicateProjectRowProps) {
  const year = getProjectYear(project);
  const maxYear = Math.max(...groupYears);
  const isNewest = year !== null && year === maxYear;

  return (
    <tr
      className={`border-b border-slate-100 transition-colors hover:bg-violet-50/30 ${
        isNewest ? 'border-r-2 border-r-violet-400' : ''
      }`}
    >
      <td className="w-16 px-4 py-3 text-sm font-black text-blue-600">{year ?? '—'}</td>
      <td className="w-32 px-4 py-3 font-mono text-xs text-slate-700">{project.contractId || '—'}</td>
      <td className="w-40 px-4 py-3 text-sm text-slate-700">{project.leadAuthor || '—'}</td>
      <td className="w-36 px-4 py-3 text-xs text-slate-500">{project.department || '—'}</td>
      <td className="w-32 px-4 py-3">{getStatusBadge(project.status)}</td>
      <td className="w-24 px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onView(project)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600
                       hover:bg-blue-100"
            title="Xem chi tiết"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(project)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600
                       hover:bg-amber-100"
            title="Chỉnh sửa"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
