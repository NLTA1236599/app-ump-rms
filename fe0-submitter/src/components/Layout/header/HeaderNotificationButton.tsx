import { useNavigate } from 'react-router-dom';

import { HeaderBellIcon } from './HeaderIcons.js';
import { HEADER_IDENTITY_BG } from './headerConstants.js';

export function HeaderNotificationButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/thong-bao')}
      className="relative flex size-9 cursor-pointer items-center justify-center rounded-full bg-transparent transition-colors duration-150 hover:bg-white/10"
      aria-label="Thông báo"
    >
      <HeaderBellIcon className="size-5 text-white" />
      <span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ boxShadow: `inset 0 0 0 0 ${HEADER_IDENTITY_BG}` }}
        aria-hidden
      />
    </button>
  );
}
