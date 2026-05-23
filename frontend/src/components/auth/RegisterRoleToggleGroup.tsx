import { REGISTER_ROLE_CARDS, type RegisterRoleId } from './registerRoles.js';

type RegisterRoleToggleGroupProps = {
  selected: ReadonlySet<RegisterRoleId>;
  onChange: (next: ReadonlySet<RegisterRoleId>) => void;
};

/** Accessible role cards — hidden checkbox + styled label (`register-component-analysis.md` §10, §18). */
export function RegisterRoleToggleGroup({ selected, onChange }: RegisterRoleToggleGroupProps) {
  const toggle = (id: RegisterRoleId) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {REGISTER_ROLE_CARDS.map((role) => {
        const isOn = selected.has(role.id);
        const inputId = `register-role-${role.id}`;
        return (
          <div key={role.id} className="relative">
            <input
              id={inputId}
              type="checkbox"
              className="peer sr-only"
              checked={isOn}
              onChange={() => toggle(role.id)}
              aria-describedby="register-role-help"
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
                <span className="block text-[14px] font-semibold text-[#1a1a1a]">{role.title}</span>
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
      <p id="register-role-help" className="mt-2 text-[12px] leading-snug text-[#6b7280]">
        Đã chọn {selected.size} vai trò. Có thể có nhiều vai trò cùng lúc — khi đăng nhập sẽ chọn vai trò cho
        session.
      </p>
    </div>
  );
}
