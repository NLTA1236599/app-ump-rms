type Props = {
  checked: boolean;
  editable: boolean;
  onChange: (checked: boolean) => void;
  tooltip?: string;
  ariaLabel?: string;
};

export function PermissionCheckbox({ checked, editable, onChange, tooltip, ariaLabel }: Props) {
  const boxStyle = editable
    ? 'cursor-pointer border-slate-300 bg-white hover:border-blue-400 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-300 peer-focus-visible:ring-offset-1 peer-checked:border-blue-600 peer-checked:bg-blue-600'
    : 'cursor-not-allowed border-slate-200 bg-slate-100 opacity-40 peer-checked:border-slate-300 peer-checked:bg-slate-200';

  return (
    <label className="inline-flex items-center justify-center" title={tooltip}>
      <input
        type="checkbox"
        checked={checked}
        disabled={!editable}
        onChange={(event) => {
          if (editable) onChange(event.target.checked);
        }}
        className="peer sr-only"
        aria-label={ariaLabel ?? (editable ? 'Thay đổi quyền' : 'Quyền này không thể thay đổi')}
      />
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all duration-150 ${boxStyle}`}
      >
        <svg
          className={`h-3 w-3 ${editable ? 'text-white' : 'text-slate-500'} ${checked ? 'opacity-100' : 'opacity-0'}`}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </label>
  );
}
