import { HeaderHomeIcon } from './HeaderIcons.js';
import { HEADER_HORIZONTAL_PADDING, HEADER_NAV_BG, HEADER_TAB_ACTIVE_TEXT } from './headerConstants.js';
import { HEADER_NAV_TABS, type HeaderNavTabId } from './headerNav.js';

type PrimaryNavBarProps = {
  activeTab: HeaderNavTabId | null;
  isHomeActive: boolean;
  onHomeClick: () => void;
  onTabChange: (tabId: HeaderNavTabId) => void;
};

const inactiveTabClass =
  'shrink-0 px-4 py-2.5 text-sm font-medium text-white/90 transition-colors duration-150 hover:bg-white/10';

const activeTabClass =
  'shrink-0 px-4 py-2.5 text-sm font-semibold bg-white rounded-t-md -mb-px border-b border-white transition-colors duration-150';

export function PrimaryNavBar({ activeTab, isHomeActive, onHomeClick, onTabChange }: PrimaryNavBarProps) {
  return (
    <nav style={{ backgroundColor: HEADER_NAV_BG }} aria-label="Menu chính">
      <div
        className={`mx-auto flex h-10 max-w-[1600px] items-center overflow-x-auto ${HEADER_HORIZONTAL_PADDING}`}
      >
        <button
          type="button"
          onClick={onHomeClick}
          className={[
            'mr-0.5 shrink-0 rounded-sm px-3 py-2 text-white transition-colors duration-150',
            isHomeActive ? 'bg-black/10' : 'hover:bg-black/10',
          ].join(' ')}
          aria-label="Trang chủ"
          aria-current={isHomeActive ? 'page' : undefined}
        >
          <HeaderHomeIcon className="size-[17px]" />
        </button>

        {HEADER_NAV_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={isActive ? activeTabClass : inactiveTabClass}
              style={isActive ? { color: HEADER_TAB_ACTIVE_TEXT } : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
