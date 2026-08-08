import { RESEARCH_FIELD_OPTIONS } from './constants.js';
import { FieldLabel } from './FieldLabel.js';
import { selectBase, selectChevronStyle } from './formStyles.js';

type ResearchFieldSelectorProps = {
  selected: string[];
  onChange: (field: string) => void;
};

/** Single-select dropdown for Lĩnh vực nghiên cứu */
export function ResearchFieldSelector({ selected, onChange }: ResearchFieldSelectorProps) {
  const value = selected[0] ?? '';

  return (
    <div id="research-fields">
      <FieldLabel htmlFor="research-field">Lĩnh vực nghiên cứu</FieldLabel>
      <select
        id="research-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${selectBase} pr-9`}
        style={selectChevronStyle}
        aria-label="Lĩnh vực nghiên cứu"
      >
        <option value="">— Chọn lĩnh vực nghiên cứu —</option>
        {RESEARCH_FIELD_OPTIONS.map((field) => (
          <option key={field} value={field}>
            {field}
          </option>
        ))}
      </select>
    </div>
  );
}
