import type { KanbanColumnTheme } from './types.js';
import { PlusIcon } from './progressIcons.js';

type AddTaskFooterButtonProps = {
  theme: KanbanColumnTheme;
  onClick: () => void;
};

export function AddTaskFooterButton({ theme, onClick }: AddTaskFooterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed bg-white/60 text-[11px] font-semibold uppercase transition-colors duration-150 ${theme.dashedBtn} ${theme.hoverBtn}`}
    >
      <PlusIcon className="h-3 w-3 shrink-0" />
      TẠO TASK MỚI
    </button>
  );
}
