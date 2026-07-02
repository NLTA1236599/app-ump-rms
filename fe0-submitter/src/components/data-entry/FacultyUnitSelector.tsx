import { FACULTY_UNIT_OPTIONS } from './constants.js';

type FacultyUnitSelectorProps = {
  selected: string[];
  onToggle: (unit: string) => void;
  error?: string;
};

/** Multi-choice selector for Khoa / Đơn vị */
export function FacultyUnitSelector({ selected, onToggle, error }: FacultyUnitSelectorProps) {
  return (
    <div id="faculty-units">
      <p className="mb-1.5 block text-xs font-medium text-slate-600">
        Khoa / Đơn vị
        <span className="ml-0.5 text-red-500">*</span>
      </p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Khoa / Đơn vị">
        {FACULTY_UNIT_OPTIONS.map((unit) => {
          const on = selected.includes(unit);
          return (
            <button
              key={unit}
              type="button"
              onClick={() => onToggle(unit)}
              className={[
                'cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-all duration-150',
                on
                  ? 'border border-blue-600 bg-blue-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-500',
              ].join(' ')}
            >
              {unit}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-1 text-[10px] text-red-500">{error}</p> : null}
    </div>
  );
}
