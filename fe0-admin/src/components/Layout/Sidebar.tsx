import { NavLink, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore.js';
import { usernameToEmail } from '../../utils/loginIdentifier.js';

const ICON_CLASS = 'h-5 w-5 shrink-0';

function DashboardIcon() {
  return (
    <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 6A2.25 2.25 0 0 1 15.75 3.75H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  );
}

function FeaturePermissionIcon() {
  return (
    <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
      />
    </svg>
  );
}

function UnitPermissionIcon() {
  return (
    <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 21h19.5M3.75 3v18m16.5-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"
      />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15.75"
      />
    </svg>
  );
}

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/users', label: 'Quản lý người dùng', icon: UsersIcon },
  { to: '/permissions', label: 'Phân quyền tính năng', icon: FeaturePermissionIcon },
  { to: '/topic-permissions', label: 'Phân quyền theo đơn vị', icon: UnitPermissionIcon },
  { to: '/operation-history', label: 'Lịch sử thao tác', icon: HistoryIcon },
] as const;

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

export function Sidebar({ collapsed, onToggle }: Props) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.displayName ?? user?.username ?? '';

  return (
    <aside
      className={[
        'flex h-full min-h-0 shrink-0 flex-col bg-blue-800 text-white transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-60',
      ].join(' ')}
    >
      <div
        className={[
          'border-b border-blue-700 font-bold tracking-wide',
          collapsed ? 'px-2 py-4 text-center text-sm' : 'px-6 py-5 text-xl',
        ].join(' ')}
        title="RMS Admin"
      >
        {collapsed ? 'RMS' : 'RMS Admin'}
      </div>

      {user && (
        <div
          className={[
            'border-b border-blue-700 text-xs text-blue-200',
            collapsed ? 'flex justify-center px-2 py-3' : 'px-6 py-3',
          ].join(' ')}
          title={`${displayName}\n${usernameToEmail(user.username)}`}
        >
          {collapsed ? (
            <UsersIcon />
          ) : (
            <>
              <p className="font-medium text-white">{displayName}</p>
              <p>{usernameToEmail(user.username)}</p>
            </>
          )}
        </div>
      )}

      <nav className={['flex-1 space-y-1 py-4', collapsed ? 'px-2' : 'px-4'].join(' ')}>
        {NAV_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              title={link.label}
              className={({ isActive }) =>
                [
                  'flex items-center rounded-lg text-sm font-medium transition',
                  collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2',
                  isActive ? 'bg-blue-600 text-white' : 'text-blue-100 hover:bg-blue-700',
                ].join(' ')
              }
            >
              <Icon />
              {collapsed ? <span className="sr-only">{link.label}</span> : link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className={['border-t border-blue-700 space-y-1', collapsed ? 'px-2 py-3' : 'px-4 py-4'].join(' ')}>
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
          className={[
            'flex w-full items-center rounded-lg text-sm text-blue-200 transition hover:bg-blue-700 hover:text-white',
            collapsed ? 'justify-center px-0 py-2' : 'gap-2 px-4 py-2 text-left',
          ].join(' ')}
        >
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12l-7.5 7.5M3 12h18" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12l7.5-7.5M21 12H3" />
            )}
          </svg>
          {collapsed ? null : 'Thu gọn'}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          title="Đăng xuất"
          className={[
            'flex w-full items-center rounded-lg text-sm text-blue-200 transition hover:bg-blue-700 hover:text-white',
            collapsed ? 'justify-center px-0 py-2' : 'gap-2 px-4 py-2 text-left',
          ].join(' ')}
        >
          <LogoutIcon />
          {collapsed ? null : 'Đăng xuất'}
        </button>
      </div>
    </aside>
  );
}
