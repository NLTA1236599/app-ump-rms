import { FacultyUnitSelector } from './FacultyUnitSelector.js';
import { LeadersEditor } from './LeadersEditor.js';
import { MembersEditor } from './MembersEditor.js';
import { ResearchFieldSelector } from './ResearchFieldSelector.js';
import { TagSelector } from './TagSelector.js';
import { FieldLabel } from './FieldLabel.js';
import { SectionHeader } from './SectionHeader.js';
import { inputBase, inputError } from './formStyles.js';
import {
  primaryLeaderBirthYear,
  primaryLeaderName,
  type ProjectLeader,
} from './projectLeaders.js';
import type { DataEntryFormData, FormErrors } from './types.js';

type Props = {
  form: DataEntryFormData;
  errors: FormErrors;
  setField: <K extends keyof DataEntryFormData>(key: K, value: DataEntryFormData[K]) => void;
  setCategoryTag: (tag: string) => void;
  setResearchField: (field: string) => void;
  setFacultyUnit: (unit: string) => void;
};

export function GeneralInfoSection({
  form,
  errors,
  setField,
  setCategoryTag,
  setResearchField,
  setFacultyUnit,
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

        <div className="lg:col-span-4">
          <LeadersEditor
            leaders={form.leaders}
            error={errors.leaders ?? errors.principalInvestigator}
            onChange={(leaders: ProjectLeader[]) => {
              setField('leaders', leaders);
              setField('principalInvestigator', primaryLeaderName(leaders));
              setField('birthYear', primaryLeaderBirthYear(leaders));
            }}
          />
        </div>

        <div className="lg:col-span-4">
          <MembersEditor
            members={form.members}
            onChange={(members) => setField('members', members)}
          />
        </div>

        <div className="lg:col-span-2">
          <ResearchFieldSelector
            selected={form.researchFields}
            onChange={setResearchField}
          />
        </div>
        <div className="lg:col-span-2">
          <TagSelector
            selected={form.categoryTags}
            otherValue={form.categoryOther}
            onChange={setCategoryTag}
            onOtherChange={(v) => setField('categoryOther', v)}
            error={errors.categoryTags}
          />
        </div>
        <div className="lg:col-span-2">
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
          <FacultyUnitSelector
            selected={form.facultyUnits}
            onChange={setFacultyUnit}
            error={errors.facultyUnits}
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
      </div>
    </section>
  );
}
