import type { StatCardModel } from './projectAnalytics.js';

export function StatsRow({ stats }: { stats: StatCardModel[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 shadow-sm
                     transition-shadow duration-150 hover:shadow-md"
        >
          <div className="mb-1 flex items-center justify-between">
            <div
              className={`${stat.iconBg ?? 'bg-slate-100'} ${stat.iconColor ?? 'text-slate-600'}
                          flex h-6 w-6 items-center justify-center rounded-md`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
              </svg>
            </div>
          </div>
          <p className="truncate text-[10px] font-medium text-slate-500" title={stat.label}>
            {stat.label}
          </p>
          <h3
            className="mt-0.5 truncate text-base font-black tracking-tight text-slate-800"
            title={String(stat.value)}
          >
            {stat.value}
          </h3>
        </div>
      ))}
    </div>
  );
}
