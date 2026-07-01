import { getRoleLabel } from './mentionUtils.js';
import type { MentionCandidate } from './mentionTypes.js';

type MentionPickerProps = {
  candidates: MentionCandidate[];
  highlightedIndex: number;
  onSelect: (candidate: MentionCandidate) => void;
  className?: string;
};

export function MentionPicker({
  candidates,
  highlightedIndex,
  onSelect,
  className = '',
}: MentionPickerProps) {
  if (candidates.length === 0) {
    return (
      <div
        className={`absolute z-50 w-72 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500 shadow-lg ${className}`}
      >
        Không tìm thấy tài khoản phù hợp.
      </div>
    );
  }

  return (
    <ul
      className={`absolute z-50 max-h-56 w-72 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg ${className}`}
      role="listbox"
      aria-label="Gắn thẻ thành viên"
    >
      {candidates.map((candidate, index) => (
        <li key={candidate.id} role="option" aria-selected={index === highlightedIndex}>
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              onSelect(candidate);
            }}
            className={[
              'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
              index === highlightedIndex ? 'bg-blue-50' : 'hover:bg-slate-50',
            ].join(' ')}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {candidate.label.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-800">
                {candidate.label}
              </span>
              <span className="block truncate text-xs text-slate-500">@{candidate.username}</span>
            </span>
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              {getRoleLabel(candidate.role)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
