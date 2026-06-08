import type { ProjectStatus } from './constants.js';
import { PROJECT_STATUS } from './constants.js';
import { selectBase, selectChevronStyle } from './formStyles.js';

type FormHeaderProps = {
  mode?: 'create' | 'edit';
  projectStatus: ProjectStatus;
  onProjectStatusChange: (status: ProjectStatus) => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
};

/** spec §2 + screenshot 3 — status dropdown near actions */
export function FormHeader({
  mode = 'create',
  projectStatus,
  onProjectStatusChange,
  onCancel,
  onSave,
  isSaving,
}: FormHeaderProps) {
  const title =
    mode === 'create' ? 'Thông tin đề tài' : 'Chỉnh sửa Đề tài';

  return (
    <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-8">
      <h1 className="text-lg font-bold text-slate-800 md:text-xl">{title}</h1>

      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <label className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Tình trạng</span>
          <select
            value={projectStatus}
            onChange={(e) => onProjectStatusChange(e.target.value as ProjectStatus)}
            className={`${selectBase} w-auto min-w-[10.5rem] pr-9 font-bold`}
            style={selectChevronStyle}
          >
            {PROJECT_STATUS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition-colors duration-150 hover:bg-slate-200"
        >
          Hủy
        </button>
        <button
          type="button"
          disabled={isSaving}
          aria-busy={isSaving}
          onClick={onSave}
          className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold uppercase text-white shadow-lg
                     shadow-blue-200 transition-colors hover:bg-blue-700 enabled:cursor-pointer
                     enabled:opacity-100 disabled:cursor-wait disabled:opacity-60"
        >
          {isSaving ? 'Đang lưu...' : 'LƯU THAY ĐỔI'}
        </button>
      </div>
    </header>
  );
}
