import { useState } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext.js';
import { NotificationBell } from '../../notification-feature/index.js';
import { HeaderLogoutIcon } from './HeaderIcons.js';
import { HeaderSettingsButton } from './HeaderSettingsButton.js';
import {
  HEADER_HORIZONTAL_PADDING,
  HEADER_IDENTITY_BG,
  INSTITUTION_MAIN_LABEL,
  INSTITUTION_SUB_LABEL,
} from './headerConstants.js';

type IdentityBarProps = {
  onLogout: () => void;
  onHomeClick: () => void;
};

function resolveUserDisplayName(
  displayName: string | null | undefined,
  username: string | undefined
): string {
  const name = displayName?.trim();
  if (name) return name;
  if (username?.trim()) return username.trim();
  return 'Tài khoản';
}

export function IdentityBar({ onLogout, onHomeClick }: IdentityBarProps) {
  const { user } = useAuthContext();
  const [sealOk, setSealOk] = useState(true);
  const userLabel = resolveUserDisplayName(user?.displayName, user?.username);

  return (
    <div className="h-14" style={{ backgroundColor: HEADER_IDENTITY_BG }}>
      <div
        className={`mx-auto flex h-full max-w-[1600px] items-center justify-between ${HEADER_HORIZONTAL_PADDING}`}
      >
        <button
          type="button"
          onClick={onHomeClick}
          className="flex min-w-0 items-center gap-2.5 text-left"
          aria-label="Trang chủ Đại học Y Dược TP. Hồ Chí Minh"
        >
          {sealOk ? (
            <img
              src="/ump-seal.png"
              alt="Logo Đại học Y Dược TP. Hồ Chí Minh"
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-full object-cover"
              onError={() => setSealOk(false)}
            />
          ) : (
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#005b8e]"
              aria-hidden
            >
              UMP
            </span>
          )}

          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[10px] font-normal leading-tight tracking-normal text-white/80">
              {INSTITUTION_SUB_LABEL}
            </span>
            <span className="truncate text-sm font-bold uppercase leading-tight tracking-tight text-white md:text-base">
              {INSTITUTION_MAIN_LABEL}
            </span>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-3">
          <span className="max-w-[180px] truncate text-xs font-medium text-white" title={userLabel}>
            {userLabel}
          </span>

          <NotificationBell />

          {user?.role === 'admin' ? <HeaderSettingsButton /> : null}

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-transparent px-2.5 py-1 text-xs font-medium text-white transition-all duration-150 hover:border-red-400 hover:bg-red-500/80"
            aria-label="Đăng xuất khỏi hệ thống"
          >
            <HeaderLogoutIcon className="size-4" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
