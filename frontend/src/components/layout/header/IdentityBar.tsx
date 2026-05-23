import { useState } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext.js';
import { HeaderLogoutIcon } from './HeaderIcons.js';
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
    <div className="h-16 md:h-[68px]" style={{ backgroundColor: HEADER_IDENTITY_BG }}>
      <div
        className={`mx-auto flex h-full max-w-[1600px] items-center justify-between ${HEADER_HORIZONTAL_PADDING}`}
      >
        <button
          type="button"
          onClick={onHomeClick}
          className="flex min-w-0 items-center gap-3 text-left"
          aria-label="Trang chủ Đại học Y Dược TP. Hồ Chí Minh"
        >
          {sealOk ? (
            <img
              src="/ump-seal.png"
              alt="Logo Đại học Y Dược TP. Hồ Chí Minh"
              width={46}
              height={46}
              className="size-11 shrink-0 rounded-full object-cover md:size-[46px]"
              onError={() => setSealOk(false)}
            />
          ) : (
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#005b8e] md:size-[46px]"
              aria-hidden
            >
              UMP
            </span>
          )}

          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[11px] font-normal tracking-normal text-white/80">
              {INSTITUTION_SUB_LABEL}
            </span>
            <span className="truncate text-lg font-black uppercase leading-tight tracking-tight text-white md:text-xl">
              {INSTITUTION_MAIN_LABEL}
            </span>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-4">
          <span className="max-w-[200px] truncate text-sm font-medium text-white" title={userLabel}>
            {userLabel}
          </span>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-3 py-1.5 text-sm font-medium text-white transition-all duration-150 hover:border-red-400 hover:bg-red-500/80"
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
