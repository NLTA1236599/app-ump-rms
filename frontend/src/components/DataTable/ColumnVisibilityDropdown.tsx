import { useEffect, useId, useRef, useState } from 'react';

import { ChevronDownIcon } from './icons.js';
import { TABLE_COLUMNS } from './tableColumns.js';

type Props = {
  visibleColumns: Record<string, boolean>;
  onChange: (visible: Record<string, boolean>) => void;
};

export function ColumnVisibilityDropdown({ visibleColumns, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const visibleCount = TABLE_COLUMNS.filter((c) => visibleColumns[c.id] !== false).length;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const toggle = (id: string) => {
    onChange({ ...visibleColumns, [id]: visibleColumns[id] === false });
  };

  const selectAll = () => {
    const next = { ...visibleColumns };
    for (const col of TABLE_COLUMNS) next[col.id] = true;
    onChange(next);
  };

  const clearAll = () => {
    const next = { ...visibleColumns };
    for (const col of TABLE_COLUMNS) next[col.id] = false;
    onChange(next);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={listId}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2
                   text-xs font-black uppercase tracking-widest text-slate-700 transition-colors
                   hover:bg-slate-50"
      >
        Cột hiển thị ({visibleCount}/{TABLE_COLUMNS.length})
        <ChevronDownIcon
          className={`h-4 w-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div
          id={listId}
          role="group"
          aria-label="Chọn cột hiển thị trên bảng và Excel"
          className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white
                     shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Chọn cột
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                Chọn tất cả
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] font-semibold text-slate-500 hover:underline"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
          <ul className="max-h-80 overflow-y-auto py-1">
            {TABLE_COLUMNS.map((col) => {
              const checked = visibleColumns[col.id] !== false;
              return (
                <li key={col.id}>
                  <label
                    className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-xs
                               text-slate-700 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(col.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="truncate">{col.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <p className="border-t border-slate-100 px-3 py-2 text-[10px] text-slate-400">
            Cột bỏ chọn sẽ ẩn trên bảng và không xuất ra file Excel.
          </p>
        </div>
      ) : null}
    </div>
  );
}
