import { FEATURE_COMING_SOON_MESSAGE } from '../components/Layout/header/headerTabRoutes.js';

export function FeatureComingSoonPage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm text-slate-500">{FEATURE_COMING_SOON_MESSAGE}</p>
    </div>
  );
}
