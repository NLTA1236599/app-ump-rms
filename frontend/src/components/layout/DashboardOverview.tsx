import { DashboardModuleGrid } from './DashboardModuleGrid.js';

type DashboardOverviewProps = {
  onFeaturedModuleClick?: () => void;
};

/** Tổng quan dashboard — lưới module (spec: `dashboard-overview-analysis.md`). */
export function DashboardOverview({ onFeaturedModuleClick }: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      <DashboardModuleGrid onFeaturedClick={onFeaturedModuleClick} />
    </div>
  );
}
