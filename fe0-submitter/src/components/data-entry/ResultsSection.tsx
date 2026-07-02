import { FieldLabel } from './FieldLabel.js';
import { SectionHeader } from './SectionHeader.js';
import { inputBase, selectBase, selectChevronStyle } from './formStyles.js';
import { PROJECT_STATUS } from './constants.js';
import type { DataEntryFormData } from './types.js';
import type { ProjectStatus } from './constants.js';

type Props = {
  form: DataEntryFormData;
  setField: <K extends keyof DataEntryFormData>(key: K, value: DataEntryFormData[K]) => void;
};

export function ResultsSection({ form, setField }: Props) {
  return (
    <section>
      <SectionHeader number={6} title="Kết quả & Tình trạng" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <FieldLabel htmlFor="output">Sản phẩm đầu ra (Tóm tắt)</FieldLabel>
          <input
            id="output"
            type="text"
            value={form.outputSummary}
            onChange={(e) => setField('outputSummary', e.target.value)}
            className={inputBase}
          />
        </div>
        <div className="lg:col-span-2">
          <FieldLabel htmlFor="status-inline" required>
            Tình trạng
          </FieldLabel>
          <select
            id="status-inline"
            value={form.projectStatus}
            onChange={(e) => setField('projectStatus', e.target.value as ProjectStatus)}
            className={`${selectBase} pr-9 font-bold`}
            style={selectChevronStyle}
          >
            {PROJECT_STATUS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-2">
          <FieldLabel htmlFor="year-nt">Năm NT</FieldLabel>
          <input
            id="year-nt"
            type="text"
            value={form.yearNt}
            onChange={(e) => setField('yearNt', e.target.value)}
            className={`${inputBase} text-center`}
          />
        </div>
        <div className="lg:col-span-2">
          <FieldLabel htmlFor="academic">Năm học</FieldLabel>
          <input
            id="academic"
            type="text"
            value={form.academicYear}
            onChange={(e) => setField('academicYear', e.target.value)}
            className={`${inputBase} text-center`}
          />
        </div>
      </div>
    </section>
  );
}
