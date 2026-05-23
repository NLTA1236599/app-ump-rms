import { DateField } from './DateField.js';
import { FieldLabel } from './FieldLabel.js';
import { SectionHeader } from './SectionHeader.js';
import { inputBase, selectBase, selectChevronStyle } from './formStyles.js';
import { EXECUTION_PROGRESS } from './constants.js';
import type { DataEntryFormData } from './types.js';
import type { ExecutionProgress } from './constants.js';

type Props = {
  form: DataEntryFormData;
  setField: <K extends keyof DataEntryFormData>(key: K, value: DataEntryFormData[K]) => void;
  setProgressReportDate: (index: number, iso: string) => void;
};

export function TimelineSection({ form, setField, setProgressReportDate }: Props) {
  return (
    <section>
      <SectionHeader number={5} title="Thời gian & Tiến độ" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div>
          <FieldLabel htmlFor="dur-text">Thời gian TH (chữ)</FieldLabel>
          <input
            id="dur-text"
            type="text"
            value={form.durationText}
            onChange={(e) => setField('durationText', e.target.value)}
            className={inputBase}
          />
        </div>
        <DateField
          id="start"
          label="Bắt đầu"
          valueIso={form.startDate}
          onChangeIso={(v) => setField('startDate', v)}
        />
        <DateField
          id="end"
          label="Kết thúc"
          valueIso={form.endDate}
          onChangeIso={(v) => setField('endDate', v)}
        />
        <DateField
          id="ext"
          label="Gia hạn"
          valueIso={form.extensionDate}
          onChangeIso={(v) => setField('extensionDate', v)}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-3 lg:col-span-1">
          <p className="mb-2 text-xs font-bold text-blue-600">BC Giám định</p>
          <DateField
            id="bc-assess"
            label="Ngày BC Giám định"
            noLabel
            valueIso={form.bcAssessmentDate}
            onChangeIso={(v) => setField('bcAssessmentDate', v)}
          />
        </div>

        <div className="rounded-lg bg-slate-50 p-2 lg:col-span-3">
          <p className="mb-2 px-1 text-[10px] font-black uppercase text-slate-400">
            Thời gian báo cáo tiến độ (1-4)
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <DateField
                key={index}
                id={`bc-${index}`}
                label={`Đợt ${index + 1}`}
                valueIso={form.progressReportDates[index] ?? ''}
                onChangeIso={(v) => setProgressReportDate(index, v)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div>
          <FieldLabel htmlFor="exec-progress">Tiến độ thực hiện</FieldLabel>
          <select
            id="exec-progress"
            value={form.executionProgress}
            onChange={(e) => setField('executionProgress', e.target.value as ExecutionProgress)}
            className={selectBase}
            style={selectChevronStyle}
          >
            {EXECUTION_PROGRESS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-2">
          <FieldLabel htmlFor="report-note">Ghi chú về nộp BC</FieldLabel>
          <input
            id="report-note"
            type="text"
            value={form.reportSubmissionNote}
            onChange={(e) => setField('reportSubmissionNote', e.target.value)}
            className={inputBase}
          />
        </div>
        <DateField
          id="meeting-nt"
          label="Ngày họp NT"
          valueIso={form.meetingNtDate}
          onChangeIso={(v) => setField('meetingNtDate', v)}
        />
      </div>
    </section>
  );
}
