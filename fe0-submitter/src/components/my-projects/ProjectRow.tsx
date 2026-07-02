import { useNavigate } from 'react-router-dom';

import type { SubmitterProject } from '../../types/submitter.js';
import {
  TABLE_GRID_COLUMNS,
  formatDurationMonths,
  formatProjectCode,
} from '../../utils/projectList.js';
import { ArrowTopRightOnSquareIcon, DocumentTextIcon } from '../icons.js';
import { StatusBadge } from './StatusBadge.js';

type ProjectRowProps = {
  project: SubmitterProject;
};

export function ProjectRow({ project }: ProjectRowProps) {
  const navigate = useNavigate();
  const hasCode = Boolean(project.projectCode?.trim());

  const openProject = () => {
    navigate(`/de-tai/${project.id}`);
  };

  return (
    <div
      className="grid items-center gap-4 border-b border-slate-100 py-4 transition-colors hover:bg-blue-50/50"
      style={{ gridTemplateColumns: TABLE_GRID_COLUMNS }}
    >
      <span className={`text-sm ${hasCode ? 'font-mono font-semibold text-slate-700' : 'text-slate-400'}`}>
        {formatProjectCode(project.projectCode)}
      </span>

      <button
        type="button"
        onClick={openProject}
        className="flex min-w-0 items-center gap-2 truncate text-left"
      >
        <DocumentTextIcon className="h-4 w-4 shrink-0 text-slate-500" />
        <span className="truncate text-sm text-slate-700 hover:text-blue-700">{project.title}</span>
      </button>

      <span className="text-sm text-slate-600">{project.level}</span>
      <span className="text-sm text-slate-600">{formatDurationMonths(project.durationMonths)}</span>
      <StatusBadge status={project.status} />

      <button
        type="button"
        onClick={openProject}
        className="flex items-center gap-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800"
      >
        Mở
        <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-600" />
      </button>
    </div>
  );
}
