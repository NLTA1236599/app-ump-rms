import { FacultyUnitSelector } from './FacultyUnitSelector.js';
import { ResearchFieldSelector } from './ResearchFieldSelector.js';
import { TagSelector } from './TagSelector.js';
import { FieldLabel } from './FieldLabel.js';
import { SectionHeader } from './SectionHeader.js';
import { inputBase, inputError } from './formStyles.js';
import type { DataEntryFormData, FormErrors } from './types.js';

type Props = {
  form: DataEntryFormData;
  errors: FormErrors;
  setField: <K extends keyof DataEntryFormData>(key: K, value: DataEntryFormData[K]) => void;
  toggleCategoryTag: (tag: string) => void;
  toggleResearchField: (field: string) => void;
  toggleFacultyUnit: (unit: string) => void;
};

export function GeneralInfoSection({
  form,
  errors,
  setField,
  toggleCategoryTag,
  toggleResearchField,
  toggleFacultyUnit,
}: Props) {
  return (
    <section>
      <SectionHeader number={2} title="Thông tin chung & Nhân sự" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-4">
          <FieldLabel htmlFor="title" required>
            Tên đề tài
          </FieldLabel>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            className={`${inputBase} ${errors.title ? inputError : ''}`}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title ? <p className="mt-1 text-[10px] text-red-500">{errors.title}</p> : null}
        </div>

        <div className="lg:col-span-3">
          <FieldLabel htmlFor="principal" required>
            Chủ nhiệm đề tài
          </FieldLabel>
          <input
            id="principal"
            type="text"
            value={form.principalInvestigator}
            onChange={(e) => setField('principalInvestigator', e.target.value)}
            className={`${inputBase} ${errors.principalInvestigator ? inputError : ''}`}
          />
          {errors.principalInvestigator ? (
            <p className="mt-1 text-[10px] text-red-500">{errors.principalInvestigator}</p>
          ) : null}
        </div>
        <div className="lg:col-span-1">
          <FieldLabel htmlFor="birth-year">Năm sinh</FieldLabel>
          <input
            id="birth-year"
            type="text"
            inputMode="numeric"
            value={form.birthYear}
            onChange={(e) => setField('birthYear', e.target.value)}
            className={inputBase}
          />
        </div>

        <div className="lg:col-span-4">
          <FieldLabel htmlFor="members">Thành viên tham gia</FieldLabel>
          <textarea
            id="members"
            value={form.members}
            onChange={(e) => setField('members', e.target.value)}
            placeholder="Liệt kê tên các thành viên..."
            rows={3}
            className={`${inputBase} min-h-[5rem] resize-y`}
          />
        </div>

        <div className="lg:col-span-2">
          <ResearchFieldSelector
            selected={form.researchFields}
            onToggle={toggleResearchField}
          />
        </div>
        <div className="lg:col-span-1">
          <FieldLabel htmlFor="rtype">Loại hình NC</FieldLabel>
          <input
            id="rtype"
            type="text"
            value={form.researchType}
            onChange={(e) => setField('researchType', e.target.value)}
            className={inputBase}
          />
        </div>
        <div className="lg:col-span-2">
          <TagSelector
            selected={form.categoryTags}
            otherValue={form.categoryOther}
            onToggle={toggleCategoryTag}
            onOtherChange={(v) => setField('categoryOther', v)}
            error={errors.categoryTags}
          />
        </div>

        <div className="lg:col-span-2">
          <FieldLabel htmlFor="dept">Bộ môn</FieldLabel>
          <input
            id="dept"
            type="text"
            value={form.department}
            onChange={(e) => setField('department', e.target.value)}
            className={inputBase}
          />
        </div>
        <div className="lg:col-span-4">
          <FacultyUnitSelector
            selected={form.facultyUnits}
            onToggle={toggleFacultyUnit}
            error={errors.facultyUnits}
          />
        </div>
      </div>
    </section>
  );
}
