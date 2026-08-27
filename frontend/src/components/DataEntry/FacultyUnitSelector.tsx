import { FACULTY_UNIT_OPTIONS } from './constants.js';
import { departmentsForWorkUnit } from './departmentsByUnit.js';
import { FieldLabel } from './FieldLabel.js';
import { inputBase, inputError, selectBase, selectChevronStyle } from './formStyles.js';

type FacultyUnitSelectorProps = {
  selected: string[];
  onChange: (unit: string) => void;
  error?: string;
};

/** Single-select dropdown for Đơn vị chủ trì */
export function FacultyUnitSelector({ selected, onChange, error }: FacultyUnitSelectorProps) {
  const value = selected[0] ?? '';

  return (
    <div id="faculty-units">
      <FieldLabel htmlFor="faculty-unit" required>
        Đơn vị chủ trì
      </FieldLabel>
      <select
        id="faculty-unit"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${selectBase} pr-9 ${error ? inputError : ''}`}
        style={selectChevronStyle}
        aria-invalid={Boolean(error)}
      >
        <option value="">— Chọn đơn vị chủ trì —</option>
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

type WorkUnitSelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
};

/** Dropdown for Đơn vị công tác — same list as Đơn vị chủ trì. */
export function WorkUnitSelect({ id, value, onChange }: WorkUnitSelectProps) {
  const known = (FACULTY_UNIT_OPTIONS as readonly string[]).includes(value);
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${selectBase} pr-9`}
      style={selectChevronStyle}
      aria-label="Đơn vị công tác"
    >
      <option value="">— Chọn đơn vị công tác —</option>
      {!known && value ? <option value={value}>{value}</option> : null}
      {FACULTY_UNIT_OPTIONS.map((unit) => (
        <option key={unit} value={unit}>
          {unit}
        </option>
      ))}
    </select>
  );
}

type DepartmentSelectProps = {
  id: string;
  workUnit: string;
  value: string;
  onChange: (value: string) => void;
};

/** Bộ môn dropdown — options depend on Đơn vị công tác. */
export function DepartmentSelect({ id, workUnit, value, onChange }: DepartmentSelectProps) {
  const options = departmentsForWorkUnit(workUnit);
  const known = options.includes(value);

  if (!workUnit.trim()) {
    return (
      <select
        id={id}
        value=""
        disabled
        className={`${selectBase} cursor-not-allowed bg-slate-50 pr-9 text-slate-400`}
        style={selectChevronStyle}
        aria-label="Bộ môn"
      >
        <option value="">— Chọn đơn vị công tác trước —</option>
      </select>
    );
  }

  if (options.length === 0) {
    return (
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Bộ môn / Đơn vị trực thuộc..."
        className={inputBase}
        aria-label="Bộ môn"
      />
    );
  }

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${selectBase} pr-9`}
      style={selectChevronStyle}
      aria-label="Bộ môn"
    >
      <option value="">— Chọn bộ môn —</option>
      {!known && value ? <option value={value}>{value}</option> : null}
      {options.map((dept) => (
        <option key={dept} value={dept}>
          {dept}
        </option>
      ))}
    </select>
  );
}

