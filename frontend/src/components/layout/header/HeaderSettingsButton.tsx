import { HeaderSettingsIcon } from './HeaderIcons.js';

const ADMIN_APP_URL =
  import.meta.env.VITE_ADMIN_APP_URL ??
  (import.meta.env.DEV ? 'http://localhost:5174/' : '/admin');

export function HeaderSettingsButton() {
  return (
    <button
      type="button"
      onDoubleClick={() => {
        window.location.assign(ADMIN_APP_URL);
      }}
      className="relative flex size-9 cursor-pointer items-center justify-center rounded-full bg-transparent transition-colors duration-150 hover:bg-white/10"
      aria-label="Cài đặt"
      title="Nhấp đúp để mở trang quản trị"
    >
      <HeaderSettingsIcon className="size-5 text-white" />
    </button>
  );
}
