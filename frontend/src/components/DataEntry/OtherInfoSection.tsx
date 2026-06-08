import { DateField } from './DateField.js';
import { FieldLabel } from './FieldLabel.js';
import { SectionHeader } from './SectionHeader.js';
import { inputBase, inputError, selectBase, selectChevronStyle } from './formStyles.js';
import { GENDER_OPTIONS } from './constants.js';
import { formatSupervisorLabel, useSupervisorAccounts } from './useSupervisorAccounts.js';
import type { DataEntryFormData, FormErrors } from './types.js';
import type { Gender } from './constants.js';

type Props = {
  form: DataEntryFormData;
  errors: FormErrors;
  setField: <K extends keyof DataEntryFormData>(key: K, value: DataEntryFormData[K]) => void;
};

export function OtherInfoSection({ form, errors, setField }: Props) {
  const supervisors = useSupervisorAccounts();

  return (
    <section>
      <SectionHeader number={8} title="Thông tin khác" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <DateField
          id="remind"
          label="Thời điểm nhắc"
          valueIso={form.reminderAt}
          onChangeIso={(v) => setField('reminderAt', v)}
        />
        <DateField
          id="complete"
          label="Thời điểm NT (Hoàn tất)"
          valueIso={form.completionAt}
          onChangeIso={(v) => setField('completionAt', v)}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div>
          <FieldLabel htmlFor="gender">Giới tính Chủ nhiệm</FieldLabel>
          <select
            id="gender"
            value={form.principalGender}
            onChange={(e) => setField('principalGender', e.target.value as Gender)}
            className={selectBase}
            style={selectChevronStyle}
          >
            {GENDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.transferForward}
              onChange={(e) => setField('transferForward', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-600">Chuyển tiếp</span>
          </label>
        </div>
        <div className="lg:col-span-2">
          <label htmlFor="liqui" className="mb-1.5 block text-xs font-medium text-red-600">
            Lý do thanh lý
          </label>
          <input
            id="liqui"
            type="text"
            value={form.liquidationReason}
            onChange={(e) => setField('liquidationReason', e.target.value)}
            className={inputBase}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <FieldLabel htmlFor="principal-email">Email Chủ nhiệm</FieldLabel>
          <input
            id="principal-email"
            type="email"
            autoComplete="email"
            value={form.principalEmail}
            onChange={(e) => setField('principalEmail', e.target.value)}
            placeholder="ten.chu.nhiem@ump.edu.vn"
            className={`${inputBase} ${errors.principalEmail ? inputError : ''}`}
            aria-invalid={Boolean(errors.principalEmail)}
          />
          {errors.principalEmail ? (
            <p className="mt-1 text-[10px] text-red-500">{errors.principalEmail}</p>
          ) : null}
        </div>
        <div className="lg:col-span-2">
          <FieldLabel htmlFor="supervisor">Người giám sát</FieldLabel>
          <select
            id="supervisor"
            value={form.supervisorId}
            onChange={(e) => setField('supervisorId', e.target.value)}
            className={`${selectBase} ${errors.supervisorId ? inputError : ''}`}
            style={selectChevronStyle}
            aria-invalid={Boolean(errors.supervisorId)}
          >
            <option value="">— Chọn người giám sát —</option>
            {supervisors.map((user) => (
              <option key={user.id} value={user.id}>
                {formatSupervisorLabel(user)}
              </option>
            ))}
          </select>
          {supervisors.length === 0 ? (
            <p className="mt-1 text-[10px] text-slate-500">
              Chưa có tài khoản giám sát (admin/chuyên viên). Vui lòng đăng nhập và thử lại.
            </p>
          ) : null}
          {errors.supervisorId ? (
            <p className="mt-1 text-[10px] text-red-500">{errors.supervisorId}</p>
          ) : null}
        </div>
      </div>

      <div className="mb-8 mt-6">
        <FieldLabel htmlFor="notes">Mô tả/Ghi chú chung</FieldLabel>
        <textarea
          id="notes"
          value={form.generalNotes}
          onChange={(e) => setField('generalNotes', e.target.value)}
          rows={4}
          className={`${inputBase} min-h-[6rem] resize-y`}
        />
      </div>
    </section>
  );
}
