import { DASHBOARD_MODULES } from './dashboardModuleData.js';

type DashboardModuleGridProps = {
  onFeaturedClick?: () => void;
};

export function DashboardModuleGrid({ onFeaturedClick }: DashboardModuleGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
      {DASHBOARD_MODULES.map((mod) => (
        <button
          key={mod.id}
          type="button"
          onClick={() => mod.featured && onFeaturedClick?.()}
          className={[
            'group flex min-h-[188px] flex-col rounded-[14px] border border-chrome-divider bg-chrome-surface p-5 text-left shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-shadow',
            'hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chrome-primary',
            'cursor-pointer',
          ].join(' ')}
        >
          <div
            className={[
              'relative mb-4 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full text-white',
              mod.iconBgClass,
            ].join(' ')}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mod.iconPath} />
            </svg>
            {mod.showDot ? (
              <span
                className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-400"
                aria-hidden
              />
            ) : null}
          </div>
          <h3 className="mb-1 text-[15px] font-semibold text-chrome-text-heading">{mod.label}</h3>
          <p className="mb-4 text-[11px] uppercase leading-relaxed tracking-[0.04em] text-chrome-text-faint line-clamp-2">
            {mod.description}
          </p>
          <div className="relative mt-auto flex items-center justify-between gap-2">
            {mod.featured ? (
              <span className="text-[11px] font-semibold uppercase tracking-wide text-chrome-primary">
                Khám phá ngay
              </span>
            ) : (
              <span />
            )}
            {mod.featured ? (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chrome-primary text-white">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            ) : (
              <span className="text-chrome-text-faint" aria-hidden>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
