import type { SubmitterProjectStatus } from '../../types/submitter.js';
import { STATUS_BADGE_CONFIG } from '../../utils/projectList.js';

type StatusBadgeProps = {
  status: SubmitterProjectStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_BADGE_CONFIG[status];

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}
