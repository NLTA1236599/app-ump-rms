import type { ResearchProject } from '../DataTable/types.js';

import { DuplicateGroupCard } from './DuplicateGroupCard.js';
import { CheckCircleIcon } from './icons.js';
import type { DuplicateGroup } from './types.js';

type DuplicateGroupListProps = {
  groups: DuplicateGroup[];
  expandedGroups: Set<string>;
  hasFiltered: boolean;
  onToggleGroup: (key: string) => void;
  onView: (project: ResearchProject) => void;
  onEdit: (project: ResearchProject) => void;
};

export function DuplicateGroupList({
  groups,
  expandedGroups,
  hasFiltered,
  onToggleGroup,
  onView,
  onEdit,
}: DuplicateGroupListProps) {
  if (!hasFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircleIcon className="mb-4 h-16 w-16 text-slate-300" />
        <p className="text-lg font-bold text-slate-700">Chưa thực hiện lọc trùng</p>
        <p className="mt-1 text-sm text-slate-400">
          Nhập tiêu đề đề tài (tùy chọn), chọn bộ lọc và nhấn Lọc trùng để bắt đầu.
        </p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircleIcon className="mb-4 h-16 w-16 text-emerald-400" />
        <p className="text-lg font-bold text-slate-700">Không tìm thấy đề tài trùng tiêu đề</p>
        <p className="mt-1 text-sm text-slate-400">
          Tất cả tiêu đề đề tài trong khoảng thời gian đã chọn là duy nhất.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {groups.map((group) => (
        <DuplicateGroupCard
          key={group.normalizedTitle}
          group={group}
          isExpanded={expandedGroups.has(group.normalizedTitle)}
          onToggle={() => onToggleGroup(group.normalizedTitle)}
          onView={onView}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
