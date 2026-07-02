import type { StatusFilterId, SubmitterProject } from '../../types/submitter.js';
import { STATUS_TABS, getCountForStatus } from '../../utils/projectList.js';

type StatusFilterTabsProps = {
  activeStatus: StatusFilterId;
  projects: SubmitterProject[];
  onChange: (status: StatusFilterId) => void;
};

export function StatusFilterTabs({ activeStatus, projects, onChange }: StatusFilterTabsProps) {
  return (
    <div className="mt-5 mb-3 flex flex-wrap items-center gap-2">
      {STATUS_TABS.map((tab) => {
        const count = getCountForStatus(tab.statusValue, projects);
        const isActive = activeStatus === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors duration-150 ${
              isActive
                ? 'bg-[#1a6ec2] font-semibold text-white'
                : 'font-normal text-slate-500 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            {tab.label} {count}
          </button>
        );
      })}
    </div>
  );
}
