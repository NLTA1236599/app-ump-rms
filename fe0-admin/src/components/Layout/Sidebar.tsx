import { NavLink, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore.js';
import { usernameToEmail } from '../../utils/loginIdentifier.js';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/users', label: 'Quản lý người dùng' },
  { to: '/permissions', label: 'Phân quyền tính năng' },
] as const;

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="flex w-60 flex-col bg-blue-800 text-white">
      <div className="border-b border-blue-700 px-6 py-5 text-xl font-bold tracking-wide">
        RMS Admin
      </div>

      {user && (
        <div className="border-b border-blue-700 px-6 py-3 text-xs text-blue-200">
          <p className="font-medium text-white">{user.displayName ?? user.username}</p>
          <p>{usernameToEmail(user.username)}</p>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-4 py-4">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              [
                'block rounded-lg px-4 py-2 text-sm font-medium transition',
                isActive ? 'bg-blue-600 text-white' : 'text-blue-100 hover:bg-blue-700',
              ].join(' ')
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-blue-700 px-4 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg px-4 py-2 text-left text-sm text-blue-200 transition hover:bg-blue-700 hover:text-white"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
