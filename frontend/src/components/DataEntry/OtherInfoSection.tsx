import { DateField } from './DateField.js';
import { FieldLabel } from './FieldLabel.js';
import { SectionHeader } from './SectionHeader.js';
import { inputBase, selectBase, selectChevronStyle } from './formStyles.js';
import { GENDER_OPTIONS } from './constants.js';
import type { DataEntryFormData } from './types.js';
import type { Gender } from './constants.js';

type Props = {
  form: DataEntryFormData;
  setField: <K extends keyof DataEntryFormData>(key: K, value: DataEntryFormData[K]) => void;
};

export function OtherInfoSection({ form, setField }: Props) {
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
        <div className="lg:col-span-2">
          <FieldLabel htmlFor="code">Mã số ĐT</FieldLabel>
          <input
            id="code"
            type="text"
            value={form.projectCode}
            onChange={(e) => setField('projectCode', e.target.value)}
            placeholder="ĐT-2023-..."
            className={`${inputBase} font-mono font-bold`}
          />
        </div>
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
