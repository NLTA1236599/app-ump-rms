import { LOGIN_SESSION_ROLE_OPTIONS, LOGIN_REQUIRES_ROLE_CHOICE } from './loginSessionRoleOptions.js';

type LoginSessionRoleBlockProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
};

/**
 * “Vai trò đăng nhập” block — same card pattern as register role toggles (`RegisterRoleToggleGroup`).
 */
export function LoginSessionRoleBlock({ id, value, onChange }: LoginSessionRoleBlockProps) {
  if (!LOGIN_REQUIRES_ROLE_CHOICE) return null;

  const groupName = `${id}-session-role`;

  return (
    <div className="mb-4 mt-5">
      <p
        id={`${id}-session-role-legend`}
        className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.10em] text-ump-text-label"
      >
        Vai trò đăng nhập
      </p>
      <div
        className="flex flex-col gap-2.5"
        role="radiogroup"
        aria-labelledby={`${id}-session-role-legend`}
        aria-required
      >
        {LOGIN_SESSION_ROLE_OPTIONS.map((role) => {
          const inputId = `${id}-role-${role.value}`;
          const isOn = value === role.value;
          return (
            <div key={role.value} className="relative">
              <input
                id={inputId}
                type="radio"
                name={groupName}
                value={role.value}
                checked={isOn}
                onChange={() => onChange(role.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={inputId}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-3 transition-[border-color,background-color] ${
                  isOn
                    ? 'border-[#1a1a1a] bg-[#fafaf9]'
                    : 'border-[#e2d9ce] bg-white hover:border-[#d6cfc6]'
                } `}
              >
                <span className="text-[20px] leading-none" aria-hidden>
                  {role.icon}
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[14px] font-semibold text-[#1a1a1a]">{role.label}</span>
                  <span className="mt-0.5 block text-[12px] text-[#6b7280]">{role.subtitle}</span>
                </span>
                {isOn ? (
                  <span
                    className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-[11px] font-bold text-white"
                    aria-hidden
                  >
                    ✓
                  </span>
                ) : (
                  <span className="size-5 shrink-0 rounded-full border border-[#e2d9ce]" aria-hidden />
                )}
              </label>
            </div>
          );
        })}
      </div>
      <p className="mt-2 flex items-start gap-1.5 text-left text-[12px] leading-snug text-[#374151]">
        <span className="text-[#f59e0b]" aria-hidden>
          ⚠️
        </span>
        <span>Tài khoản có 2 vai trò — chọn 1 để đăng nhập.</span>
      </p>
    </div>
  );
}
