import type { KeyboardEvent } from 'react';

import type { MatchMode } from './types.js';

type DuplicateToolbarProps = {
  titleQuery: string;
  availableYears: number[];
  yearFrom: number | null;
  yearTo: number | null;
  matchMode: MatchMode;
  onTitleQueryChange: (value: string) => void;
  onYearFromChange: (year: number | null) => void;
  onYearToChange: (year: number | null) => void;
  onMatchModeChange: (mode: MatchMode) => void;
  onFilter: () => void;
  onExport: () => void;
  onReset: () => void;
};

const selectClass =
  'w-28 border-b border-slate-400 bg-transparent py-1 text-sm text-slate-700 focus:outline-none';

const inputClass =
  'min-w-[12rem] flex-1 border-b border-slate-400 bg-transparent py-1 text-sm text-slate-700 ' +
  'placeholder:text-slate-400 focus:border-violet-500 focus:outline-none sm:max-w-md';

export function DuplicateToolbar({
  titleQuery,
  availableYears,
  yearFrom,
  yearTo,
  matchMode,
  onTitleQueryChange,
  onYearFromChange,
  onYearToChange,
  onMatchModeChange,
  onFilter,
  onExport,
  onReset,
}: DuplicateToolbarProps) {
  const toYearOptions = availableYears.filter((y) => yearFrom === null || y >= yearFrom);

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onFilter();
  };

  return (
    <div
      className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white
                 px-4 py-3 shadow-sm"
    >
      <label className="flex min-w-[200px] flex-1 items-center gap-2 sm:min-w-[280px]">
        <span className="flex-shrink-0 text-sm font-medium text-slate-700">Tiêu đề đề tài:</span>
        <input
          type="text"
          value={titleQuery}
          onChange={(e) => onTitleQueryChange(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder="Nhập tiêu đề cần lọc..."
          className={inputClass}
          aria-label="Tiêu đề đề tài"
        />
      </label>

      <span className="flex-shrink-0 text-sm font-medium text-slate-700">Lọc năm:</span>

      <select
        value={yearFrom ?? ''}
        onChange={(e) => onYearFromChange(e.target.value ? Number(e.target.value) : null)}
        className={selectClass}
        aria-label="Từ năm"
      >
        <option value="">Từ năm...</option>
        {availableYears.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <select
        value={yearTo ?? ''}
        onChange={(e) => onYearToChange(e.target.value ? Number(e.target.value) : null)}
        className={selectClass}
        aria-label="Đến năm"
      >
        <option value="">Đến năm...</option>
        {toYearOptions.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs">
        <button
          type="button"
          onClick={() => onMatchModeChange('strict')}
          className={
            matchMode === 'strict'
              ? 'rounded-md bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-sm'
              : 'px-3 py-1.5 text-slate-500 hover:text-slate-700'
          }
        >
          Khớp chính xác
        </button>
        <button
          type="button"
          onClick={() => onMatchModeChange('fuzzy')}
          className={
            matchMode === 'fuzzy'
              ? 'rounded-md bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-sm'
              : 'px-3 py-1.5 text-slate-500 hover:text-slate-700'
          }
        >
          Khớp tương đối
        </button>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onFilter}
          className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-black uppercase tracking-widest
                     text-white shadow-md shadow-violet-200 hover:bg-violet-700"
        >
          Lọc trùng
        </button>
        <button
          type="button"
          onClick={onExport}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black uppercase tracking-widest
                     text-white shadow-md shadow-emerald-200 hover:bg-emerald-700"
        >
          XUẤT EXCEL
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-black
                     uppercase tracking-widest text-red-600 hover:bg-red-100"
        >
          RESET
        </button>
      </div>
    </div>
  );
}
