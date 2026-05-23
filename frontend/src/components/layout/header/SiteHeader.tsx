import { IdentityBar } from './IdentityBar.js';
import { PrimaryNavBar } from './PrimaryNavBar.js';
import type { HeaderNavTabId } from './headerNav.js';

export type SiteHeaderProps = {
  activeTab: HeaderNavTabId | null;
  isHomeActive: boolean;
  onHomeClick: () => void;
  onTabChange: (tabId: HeaderNavTabId) => void;
  onLogout: () => void;
};

/** Two-layer sticky site header — spec: `Rechange Header.md` */
export function SiteHeader({
  activeTab,
  isHomeActive,
  onHomeClick,
  onTabChange,
  onLogout,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-[100] w-full">
      <IdentityBar onLogout={onLogout} onHomeClick={onHomeClick} />
      <PrimaryNavBar
        activeTab={activeTab}
        isHomeActive={isHomeActive}
        onHomeClick={onHomeClick}
        onTabChange={onTabChange}
      />
    </header>
  );
}
