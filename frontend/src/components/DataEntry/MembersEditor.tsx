import { DepartmentSelect, WorkUnitSelect } from './FacultyUnitSelector.js';
import { isDepartmentInWorkUnit } from './departmentsByUnit.js';
import { inputBase } from './formStyles.js';
import {
  createEmptyMember,
  type ProjectMember,
} from './projectMembers.js';

type Props = {
  members: ProjectMember[];
  onChange: (members: ProjectMember[]) => void;
};

const MEMBER_FIELDS: Array<{
  key: keyof Omit<ProjectMember, 'id'>;
  label: string;
  placeholder: string;
  inputMode?: 'email' | 'numeric' | 'text';
  colSpan: string;
}> = [
  {
    key: 'fullName',
    label: 'Họ tên',
    placeholder: 'Nguyễn Văn A',
    colSpan: 'lg:col-span-2',
  },
  {
    key: 'academicTitle',
    label: 'Học hàm/Học vị',
    placeholder: 'PGS.TS / ThS / BS...',
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
    colSpan: 'lg:col-span-2',
  },
  {
    key: 'workUnit',
    label: 'Đơn vị công tác',
    placeholder: 'Khoa / Viện / Bệnh viện...',
    colSpan: 'lg:col-span-1',
  },
  {
    key: 'department',
    label: 'Bộ môn',
    placeholder: 'Bộ môn / Đơn vị trực thuộc...',
    colSpan: 'lg:col-span-1',
  },
  {
    key: 'projectRole',
    label: 'Chức danh thực hiện đề tài',
    placeholder: 'Thư ký / Thành viên chính...',
    colSpan: 'lg:col-span-1',
  },
];

export function MembersEditor({ members, onChange }: Props) {
  const rows = members.length > 0 ? members : [createEmptyMember()];

  const updateMember = (id: string, key: keyof Omit<ProjectMember, 'id'>, value: string) => {
    onChange(rows.map((m) => (m.id === id ? { ...m, [key]: value } : m)));
  };

  const addMember = () => {
    onChange([...rows, createEmptyMember()]);
  };

  const removeMember = (id: string) => {
    if (rows.length <= 1) {
      onChange([createEmptyMember()]);
      return;
    }
    onChange(rows.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="mb-0 text-xs font-medium text-slate-600">Thành viên tham gia</p>
        <button
          type="button"
          onClick={addMember}
          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px]
                     font-semibold uppercase tracking-wide text-blue-700 transition-colors
                     hover:bg-blue-100"
        >
          + Thêm thành viên
        </button>
      </div>

      <div className="space-y-3">
        {rows.map((member, index) => (
          <div
            key={member.id}
            className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Thành viên {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeMember(member.id)}
                className="rounded-md px-2 py-1 text-[11px] font-medium text-red-600
                           transition-colors hover:bg-red-50"
                aria-label={`Xóa thành viên ${index + 1}`}
              >
                Xóa
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
              {MEMBER_FIELDS.map((field) => {
                const fieldId = `member-${member.id}-${field.key}`;
                return (
                  <div key={field.key} className={field.colSpan}>
                    <label
                      htmlFor={fieldId}
                      className="mb-1 block text-[11px] font-semibold text-slate-600"
                    >
                      {field.label}
                    </label>
                    {field.key === 'workUnit' ? (
                      <WorkUnitSelect
                        id={fieldId}
                        value={member.workUnit}
                        onChange={(value) => {
                          const nextDept = isDepartmentInWorkUnit(value, member.department)
                            ? member.department
                            : '';
                          onChange(
                            rows.map((m) =>
                              m.id === member.id ? { ...m, workUnit: value, department: nextDept } : m,
                            ),
                          );
                        }}
                      />
                    ) : field.key === 'department' ? (
                      <DepartmentSelect
                        id={fieldId}
                        workUnit={member.workUnit}
                        value={member.department}
                        onChange={(value) => updateMember(member.id, 'department', value)}
                      />
                    ) : (
                      <input
                        id={fieldId}
                        type={field.inputMode === 'email' ? 'email' : 'text'}
                        inputMode={field.inputMode}
                        value={member[field.key]}
                        onChange={(e) => updateMember(member.id, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className={inputBase}
                      />
                    )}
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
