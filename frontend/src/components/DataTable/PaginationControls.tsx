type PaginationButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
};

function PaginationButton({ label, onClick, disabled, active }: PaginationButtonProps) {
  const base = 'flex h-7 w-7 items-center justify-center rounded text-xs';
  const stateClass = active
    ? 'border border-blue-600 bg-blue-600 font-bold text-white'
    : 'border border-slate-200 text-slate-600 hover:bg-slate-50';
  const disabledClass = disabled ? 'cursor-not-allowed opacity-40' : '';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${stateClass} ${disabledClass}`}
    >
      {label}
    </button>
  );
}

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => Math.abs(p - currentPage) <= 2,
  );

  return (
    <div className="mt-3 flex items-center justify-end gap-1 px-4 pb-3">
      <PaginationButton label="◀◀" onClick={() => onPageChange(1)} disabled={currentPage === 1} />
      <PaginationButton
        label="◀"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
      {visiblePages.map((p) => (
        <PaginationButton
          key={p}
          label={String(p)}
          onClick={() => onPageChange(p)}
          active={p === currentPage}
        />
      ))}
      <PaginationButton
        label="▶"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
      <PaginationButton
        label="▶▶"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      />
    </div>
  );
}
