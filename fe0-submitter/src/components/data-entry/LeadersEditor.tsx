import { inputBase, selectBase, selectChevronStyle } from './formStyles.js';
import {
  createEmptyLeader,
  LEADER_ADD_REASON_OPTIONS,
  type LeaderAddReason,
  type ProjectLeader,
} from './projectLeaders.js';

type Props = {
  leaders: ProjectLeader[];
  onChange: (leaders: ProjectLeader[]) => void;
  error?: string;
};

const LEADER_FIELDS: Array<{
  key: keyof Pick<
    ProjectLeader,
    'fullName' | 'academicTitle' | 'nationalId' | 'email' | 'workUnit' | 'projectRole' | 'birthYear'
  >;
  label: string;
  placeholder: string;
  inputMode?: 'email' | 'numeric' | 'text';
  colSpan: string;
  required?: boolean;
}> = [
  {
    key: 'fullName',
    label: 'Họ tên',
    placeholder: 'Nguyễn Văn A',
    colSpan: 'lg:col-span-2',
    required: true,
  },
  {
    key: 'academicTitle',
    label: 'Học hàm/Học vị',
    placeholder: 'PGS.TS / ThS / BS...',
    colSpan: 'lg:col-span-1',
  },
  {
    key: 'birthYear',
    label: 'Năm sinh',
    placeholder: '1985',
    inputMode: 'numeric',
    colSpan: 'lg:col-span-1',
  },
  {
    key: 'nationalId',
    label: 'Số CCCD',
    placeholder: '001234567890',
    inputMode: 'numeric',
    colSpan: 'lg:col-span-1',
  },
  {
    key: 'email',
    label: 'Địa chỉ mail',
    placeholder: 'email@ump.edu.vn',
    inputMode: 'email',
    colSpan: 'lg:col-span-1',
  },
  {
    key: 'workUnit',
    label: 'Đơn vị công tác',
    placeholder: 'Khoa / Viện / Bệnh viện...',
    colSpan: 'lg:col-span-1',
  },
  {
    key: 'projectRole',
    label: 'Chức danh thực hiện đề tài',
    placeholder: 'Chủ nhiệm / Đồng chủ nhiệm...',
    colSpan: 'lg:col-span-1',
  },
];

export function LeadersEditor({ leaders, onChange, error }: Props) {
  const rows = leaders.length > 0 ? leaders : [createEmptyLeader()];

  const updateLeader = <K extends keyof ProjectLeader>(id: string, key: K, value: ProjectLeader[K]) => {
    onChange(rows.map((l) => (l.id === id ? { ...l, [key]: value } : l)));
  };

  const addLeader = () => {
    onChange([...rows, createEmptyLeader({ requireReason: true })]);
  };

  const removeLeader = (id: string) => {
    if (rows.length <= 1) {
      onChange([createEmptyLeader()]);
      return;
    }
    const next = rows.filter((l) => l.id !== id).map((l, index) =>
      index === 0 ? { ...l, addReason: '' as LeaderAddReason } : l,
    );
    onChange(next);
  };

  return (
    <div id="leaders-editor" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="mb-0 text-xs font-medium text-slate-600">
          Chủ nhiệm đề tài <span className="text-red-500">*</span>
        </p>
        <button
          type="button"
          onClick={addLeader}
          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px]
                     font-semibold uppercase tracking-wide text-blue-700 transition-colors
                     hover:bg-blue-100"
        >
          + Thêm chủ nhiệm
        </button>
      </div>

      {error ? <p className="text-[10px] text-red-500">{error}</p> : null}

      <div className="space-y-3">
        {rows.map((leader, index) => (
          <div
            key={leader.id}
            className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {index === 0 ? 'Chủ nhiệm chính' : `Chủ nhiệm ${index + 1}`}
              </span>
              <button
                type="button"
                onClick={() => removeLeader(leader.id)}
                className="rounded-md px-2 py-1 text-[11px] font-medium text-red-600
                           transition-colors hover:bg-red-50"
                aria-label={`Xóa chủ nhiệm ${index + 1}`}
              >
                Xóa
              </button>
            </div>

            {index > 0 ? (
              <div className="mb-3 lg:max-w-sm">
                <label
                  htmlFor={`leader-${leader.id}-reason`}
                  className="mb-1 block text-[11px] font-semibold text-slate-600"
                >
                  Lý do thêm <span className="text-red-500">*</span>
                </label>
                <select
                  id={`leader-${leader.id}-reason`}
                  value={leader.addReason || 'co_leader'}
                  onChange={(e) =>
                    updateLeader(leader.id, 'addReason', e.target.value as LeaderAddReason)
                  }
                  className={selectBase}
                  style={selectChevronStyle}
                >
                  {LEADER_ADD_REASON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
              {LEADER_FIELDS.map((field) => {
                const fieldId = `leader-${leader.id}-${field.key}`;
                return (
                  <div key={field.key} className={field.colSpan}>
                    <label
                      htmlFor={fieldId}
                      className="mb-1 block text-[11px] font-semibold text-slate-600"
                    >
                      {field.label}
                      {field.required && index === 0 ? (
                        <span className="text-red-500"> *</span>
                      ) : null}
                    </label>
                    <input
                      id={fieldId}
                      type={field.inputMode === 'email' ? 'email' : 'text'}
                      inputMode={field.inputMode}
                      value={leader[field.key]}
                      onChange={(e) => updateLeader(leader.id, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={inputBase}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
