type Props = {
  unitId: string;
  savingIds: Set<string>;
  savedIds: Set<string>;
};

export function SaveStatusCell({ unitId, savingIds, savedIds }: Props) {
  const isSaving = savingIds.has(unitId);
  const isSaved = savedIds.has(unitId);

  if (isSaving) {
    return (
      <td className="sticky right-0 z-10 border-l border-slate-200 bg-white px-3 py-3 text-center transition-colors group-hover:bg-blue-50/40">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Đang lưu</span>
        </div>
      </td>
    );
  }

  if (isSaved) {
    return (
      <td className="sticky right-0 z-10 border-l border-slate-200 bg-white px-3 py-3 text-center transition-colors group-hover:bg-blue-50/40">
        <div className="flex items-center justify-center gap-1 text-xs font-medium text-emerald-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>Đã lưu</span>
        </div>
      </td>
    );
  }

  return (
    <td className="sticky right-0 z-10 border-l border-slate-200 bg-white px-3 py-3 text-center transition-colors group-hover:bg-blue-50/40">
      <span className="text-[10px] text-slate-300">—</span>
    </td>
  );
}
