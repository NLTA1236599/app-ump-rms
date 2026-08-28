import { getAvatarColor, getAvatarColorByIndex, getInitials, getShortDisplayName } from '../../utils/nameUtils.js';

type Props = {
  name: string;
  role?: string;
  colorIndex?: number;
};

export function UserColumnHeader({ name, role, colorIndex }: Props) {
  const initials = getInitials(name);
  const color = colorIndex == null ? getAvatarColor(name) : getAvatarColorByIndex(colorIndex);
  const label = getShortDisplayName(name);

  return (
    <div className="group flex cursor-default flex-col items-center gap-1 px-1" title={role ? `${name} — ${role}` : name}>
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white ring-2 ring-white transition-all group-hover:ring-blue-200"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      <span className="max-w-[64px] text-center text-[10px] font-medium leading-tight text-slate-600 break-words">
        {label}
      </span>
    </div>
  );
}
