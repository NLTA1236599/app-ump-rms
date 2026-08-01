import { FACULTY_UNIT_OPTIONS } from './constants.js';
import { FieldLabel } from './FieldLabel.js';
import { inputError, selectBase, selectChevronStyle } from './formStyles.js';

type FacultyUnitSelectorProps = {
  selected: string[];
  onChange: (unit: string) => void;
  error?: string;
};

/** Single-select dropdown for Khoa / Đơn vị */
export function FacultyUnitSelector({ selected, onChange, error }: FacultyUnitSelectorProps) {
  const value = selected[0] ?? '';

  return (
    <div id="faculty-units">
      <FieldLabel htmlFor="faculty-unit" required>
        Khoa / Đơn vị
      </FieldLabel>
      <select
        id="faculty-unit"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${selectBase} pr-9 ${error ? inputError : ''}`}
        style={selectChevronStyle}
        aria-invalid={Boolean(error)}
      >
        <option value="">— Chọn khoa / đơn vị —</option>
        {FACULTY_UNIT_OPTIONS.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-[10px] text-red-500">{error}</p> : null}
    </div>
  );
}
