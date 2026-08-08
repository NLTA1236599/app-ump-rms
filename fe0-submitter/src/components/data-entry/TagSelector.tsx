import { PROJECT_TYPE_TAGS } from './constants.js';
import { FieldLabel } from './FieldLabel.js';
import { inputBase, inputError, selectBase, selectChevronStyle } from './formStyles.js';

type TagSelectorProps = {
  selected: string[];
  otherValue: string;
  onChange: (tag: string) => void;
  onOtherChange: (value: string) => void;
  error?: string;
};

/** Single-select dropdown for Loại đề tài */
export function TagSelector({
  selected,
  otherValue,
  onChange,
  onOtherChange,
  error,
}: TagSelectorProps) {
  const value = selected[0] ?? '';
  const hasOther = value === 'Khác';

  return (
    <div id="category-tags">
      <FieldLabel htmlFor="category-tag" required>
        Loại đề tài
      </FieldLabel>
      <select
        id="category-tag"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${selectBase} pr-9 ${error ? inputError : ''}`}
        style={selectChevronStyle}
        aria-label="Loại đề tài"
        aria-invalid={Boolean(error)}
      >
        <option value="">— Chọn loại đề tài —</option>
        {PROJECT_TYPE_TAGS.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
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
