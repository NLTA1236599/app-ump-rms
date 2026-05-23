import { FunnelIcon } from './icons.js';
import type { FilterableHeaderProps } from './types.js';

export function FilterableHeader({
  label,
  colId,
  minWidth = '150px',
  className = '',
  columnFilters,
  activeFilterColumn,
  onToggleFilter,
  onFilterChange,
  onCloseFilter,
}: FilterableHeaderProps) {
  const hasFilter = Boolean(columnFilters[colId]);

  return (
    <th
      className={`relative sticky top-0 z-20 whitespace-nowrap bg-slate-50 px-3 py-2 text-left
                  text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm ${className}`}
      style={{ minWidth }}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <button
          type="button"
          onClick={() => onToggleFilter(colId)}
          className={`cursor-pointer p-0.5 ${hasFilter ? 'text-blue-600' : 'text-slate-400 hover:text-slate-500'}`}
        >
          <FunnelIcon className="h-3 w-3" />
        </button>
      </div>
      {activeFilterColumn === colId && (
        <div className="absolute left-0 top-full z-50 mt-1 rounded-lg border border-blue-300 bg-white p-2 shadow-lg">
          <input
            autoFocus
            type="text"
            aria-label={`Lọc theo ${label}`}
            className="w-40 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500
                       focus:outline-none"
            placeholder={`Lọc ${label}...`}
            value={columnFilters[colId] || ''}
            onChange={(e) => onFilterChange(colId, e.target.value)}
            onBlur={() => setTimeout(() => onCloseFilter(), 0)}
          />
        </div>
      )}
    </th>
  );
}
