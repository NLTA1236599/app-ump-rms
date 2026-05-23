import { ClipboardIcon } from './progressIcons.js';

export type KanbanViewMode = 'kanban' | 'calendar';

type KanbanSectionHeaderProps = {
  view: KanbanViewMode;
  onViewChange: (next: KanbanViewMode) => void;
};

/** Zone 2 header row — spec §4 */
export function KanbanSectionHeader({ view, onViewChange }: KanbanSectionHeaderProps) {
  return (
    <header className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-800">
        <ClipboardIcon className="h-5 w-5 shrink-0 text-slate-600" />
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">Tiến độ thực hiện</h2>
      </div>

      <div className="flex h-9 items-center rounded-2xl bg-slate-200/50 p-1">
        <button
          type="button"
          onClick={() => onViewChange('kanban')}
          className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-colors ${
            view === 'kanban'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'bg-transparent text-slate-500'
          }`}
        >
          Kanban
        </button>
        <button
          type="button"
          onClick={() => onViewChange('calendar')}
          className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-colors ${
            view === 'calendar'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'bg-transparent text-slate-500'
          }`}
        >
          Lịch
        </button>
      </div>
    </header>
  );
}
