/**

 * Application shell — composed from `layout/*` modules.

 * Stable imports: `MainLayout`, `SiteHeader`, `DashboardOverview`.

 */

export { MainLayout } from './MainLayout.js';

export { SiteHeader, DEFAULT_HEADER_NAV_TAB, type HeaderNavTabId } from './header/index.js';

export { DashboardOverview } from './DashboardOverview.js';

export type { DashboardNavId } from './dashboardNav.js';

