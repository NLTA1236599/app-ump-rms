import { RESEARCH_FIELD_OPTIONS } from './constants.js';

type ResearchFieldSelectorProps = {
  selected: string[];
  onToggle: (field: string) => void;
};

/** Multi-choice selector for Lĩnh vực NC */
export function ResearchFieldSelector({ selected, onToggle }: ResearchFieldSelectorProps) {
  return (
    <div id="research-fields">
      <p className="mb-1.5 block text-xs font-medium text-slate-600">Lĩnh vực NC</p>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Lĩnh vực NC"
      >
        {RESEARCH_FIELD_OPTIONS.map((field) => {
          const on = selected.includes(field);
          return (
            <button
              key={field}
              type="button"
              onClick={() => onToggle(field)}
              className={[
                'cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-all duration-150',
                on
                  ? 'border border-blue-600 bg-blue-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-500',
              ].join(' ')}
            >
              {field}
            </button>
          );
        })}
      </div>
    </div>
  );
}
