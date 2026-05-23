import { PROJECT_TYPE_TAGS } from './constants.js';
import { inputBase } from './formStyles.js';

type TagSelectorProps = {
  selected: string[];
  otherValue: string;
  onToggle: (tag: string) => void;
  onOtherChange: (value: string) => void;
  error?: string;
};

/** spec §6.4 */
export function TagSelector({ selected, otherValue, onToggle, onOtherChange, error }: TagSelectorProps) {
  const hasOther = selected.includes('Khác');

  return (
    <div>
      <p className="mb-1.5 block text-xs font-medium text-slate-600">
        Loại đề tài (Tags)
        <span className="ml-0.5 text-red-500">*</span>
      </p>
      <div
        className="flex flex-wrap justify-end gap-2"
        role="group"
        aria-label="Loại đề tài (Tags)"
      >
        {PROJECT_TYPE_TAGS.map((tag) => {
          const on = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
              className={[
                'cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-all duration-150',
                on
                  ? 'border border-blue-600 bg-blue-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-500',
              ].join(' ')}
            >
              {tag}
            </button>
          );
        })}
      </div>
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
