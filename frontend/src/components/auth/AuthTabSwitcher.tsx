export type AuthTabId = 'login' | 'register';

type AuthTabSwitcherProps = {
  active: AuthTabId;
  onChange: (tab: AuthTabId) => void;
};

/** Segmented control — `login-component-analysis.md` §4 + §12 (tablist). */
export function AuthTabSwitcher({ active, onChange }: AuthTabSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Chọn đăng nhập hoặc đăng ký"
      className="mb-5 flex h-[42px] w-full gap-0.5 rounded-[10px] bg-[#eef2f7] p-1"
    >
      <button
        type="button"
        role="tab"
        id="tab-login"
        aria-selected={active === 'login'}
        aria-controls="panel-login"
        tabIndex={active === 'login' ? 0 : -1}
        onClick={() => onChange('login')}
        className={`flex flex-1 items-center justify-center gap-1 rounded-lg text-[14px] transition-[background,box-shadow,color,font-weight] duration-150 ${
          active === 'login'
            ? 'bg-white font-semibold text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
            : 'bg-transparent font-normal text-[#9ca3af] hover:text-[#6b7280]'
        } `}
      >
        <span aria-hidden>→</span>
        Đăng nhập
      </button>
      <button
        type="button"
        role="tab"
        id="tab-register"
        aria-selected={active === 'register'}
        aria-controls="panel-register"
        tabIndex={active === 'register' ? 0 : -1}
        onClick={() => onChange('register')}
        className={`flex flex-1 items-center justify-center gap-1 rounded-lg text-[14px] transition-[background,box-shadow,color,font-weight] duration-150 ${
          active === 'register'
            ? 'bg-white font-semibold text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
            : 'bg-transparent font-normal text-[#9ca3af] hover:text-[#6b7280]'
        } `}
      >
        <span aria-hidden>👤</span>
        Đăng ký
      </button>
    </div>
  );
}
