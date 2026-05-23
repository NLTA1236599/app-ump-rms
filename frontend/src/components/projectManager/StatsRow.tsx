import type { StatCardModel } from './projectAnalytics.js';

export function StatsRow({ stats }: { stats: StatCardModel[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="group rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-3 flex items-center justify-between">
            <div
              className={`${stat.color} flex items-center justify-center rounded-2xl p-2.5 text-white shadow-lg shadow-blue-100`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
              </svg>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
          <h3 className="mt-1 truncate text-lg font-black text-slate-800" title={String(stat.value)}>
            {stat.value}
          </h3>
        </div>
      ))}
    </div>
  );
}
