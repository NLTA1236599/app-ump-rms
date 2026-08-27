import { PROJECT_TYPE_TAGS } from './constants.js';
import { FieldLabel } from './FieldLabel.js';
import { inputBase, inputError, selectBase, selectChevronStyle } from './formStyles.js';

type TagSelectorProps = {
  selected: string[];
  otherValue: string;
  onChange: (tag: string) => void;
  onOtherChange: (value: string) => void;
  error?: string;
  variant?: 'stacked' | 'inline';
};

/** Single-select dropdown for Loại đề tài */
export function TagSelector({
  selected,
  otherValue,
  onChange,
  onOtherChange,
  error,
  variant = 'stacked',
}: TagSelectorProps) {
  const value = selected[0] ?? '';
  const hasOther = value === 'Khác';
  const isInline = variant === 'inline';

  const selectEl = (
    <select
      id="category-tag"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${selectBase} pr-9 ${isInline ? 'w-auto min-w-[9.5rem] font-bold' : ''} ${error ? inputError : ''}`}
      style={selectChevronStyle}
      aria-label="Loại đề tài"
      aria-invalid={Boolean(error)}
    >
      <option value="">— Chọn loại —</option>
      {PROJECT_TYPE_TAGS.map((tag) => (
        <option key={tag} value={tag}>
          {tag}
        </option>
      ))}
    </select>
  );

  if (isInline) {
    return (
      <div id="category-tags" className="flex flex-wrap items-center gap-2">
        <label htmlFor="category-tag" className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Loại đề tài
            <span className="ml-0.5 text-red-500">*</span>
          </span>
          {selectEl}
        </label>
        {hasOther ? (
          <input
            type="text"
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder="Nhập loại khác..."
            className={`${inputBase} w-40`}
          />
        ) : null}
        {error ? <p className="text-[10px] text-red-500">{error}</p> : null}
      </div>
    );
  }

  return (
    <div id="category-tags">
      <FieldLabel htmlFor="category-tag" required>
        Loại đề tài
      </FieldLabel>
      {selectEl}
      {hasOther ? (
        <div className="mt-2 animate-slideUp rounded-lg bg-blue-50 p-2">
          <input
            type="text"
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder="Nhập loại khác..."
            className={inputBase}
          />
        </div>
      ) : null}
      {error ? <p className="mt-1 text-[10px] text-red-500">{error}</p> : null}
    </div>
  );
}
