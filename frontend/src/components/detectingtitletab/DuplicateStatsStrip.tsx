import type { DuplicateStats } from './types.js';
import { CalendarIcon, DocumentDuplicateIcon, DocumentTextIcon } from './icons.js';

type StatCardProps = {
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  Icon: typeof DocumentDuplicateIcon;
};

function StatCard({ label, value, iconBg, iconColor, Icon }: StatCardProps) {
  return (
    <div
      className="flex flex-1 items-center gap-4 rounded-xl border border-slate-200 bg-white
                 px-5 py-4 shadow-sm"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className={`text-2xl font-black ${iconColor}`}>{value}</p>
      </div>
    </div>
  );
}

type DuplicateStatsStripProps = {
  stats: DuplicateStats;
};

export function DuplicateStatsStrip({ stats }: DuplicateStatsStripProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-4">
      <StatCard
        label="Số nhóm trùng"
        value={stats.groupCount}
        iconBg="bg-violet-100"
        iconColor="text-violet-600"
        Icon={DocumentDuplicateIcon}
      />
      <StatCard
        label="Đề tài bị trùng"
        value={stats.projectCount}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        Icon={DocumentTextIcon}
      />
      <StatCard
        label="Năm có trùng"
        value={stats.yearCount}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        Icon={CalendarIcon}
      />
    </div>
  );
}
