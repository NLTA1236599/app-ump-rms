import type { StatCardModel } from './projectAnalytics.js';

function StatCard({ stat }: { stat: StatCardModel }) {
  return (
    <div
      className="flex min-w-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1.5 shadow-sm
                 transition-shadow duration-150 hover:shadow-md"
    >
      <div
        className={`${stat.iconBg ?? 'bg-slate-100'} ${stat.iconColor ?? 'text-slate-600'}
                    flex h-5 w-5 shrink-0 items-center justify-center rounded`}
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-medium leading-tight text-slate-500">{stat.label}</p>
        <p
          className="truncate text-[13px] font-bold leading-tight tracking-tight text-slate-800"
          title={String(stat.value)}
        >
          {stat.value}
        </p>
      </div>
    </div>
  );
}

export function StatsRow({ stats }: { stats: StatCardModel[] }) {
  const row1 = stats.slice(0, 4);
  const row2 = stats.slice(4);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {row1.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
        {row2.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </div>
  );
}
