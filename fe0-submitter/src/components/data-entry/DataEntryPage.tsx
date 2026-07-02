import { useCallback } from 'react';

import { Toast } from '../ui/Toast.js';
import { useNotification } from '../../hooks/useNotification.js';
import type { ResearchProject } from '../../types/researchProject.js';

import { ContractSection } from './ContractSection.js';
import { GeneralInfoSection } from './GeneralInfoSection.js';
import { DecisionSection } from './DecisionSection.js';
import { BudgetSection } from './BudgetSection.js';
import { TimelineSection } from './TimelineSection.js';
import { ResultsSection } from './ResultsSection.js';
import { ProductDetailSection } from './ProductDetailSection.js';
import { OtherInfoSection } from './OtherInfoSection.js';
import { FormHeader } from './FormHeader.js';
import { useDataEntryForm } from './useDataEntryForm.js';

type DataEntryPageProps = {
  mode?: 'create' | 'edit';
  project?: ResearchProject;
  onSaveProject?: (project: ResearchProject) => void | Promise<void>;
  onCancel?: () => void;
  embedded?: boolean;
};

/** Full-page form body — DataEntryfinal-spec.md */
export function DataEntryPage({
  mode = 'create',
  project,
  onSaveProject,
  onCancel,
  embedded = false,
}: DataEntryPageProps) {
  const { message, notify, dismiss } = useNotification();
  const handleSaved = useCallback(
    (saved: ResearchProject) => {
      void Promise.resolve(onSaveProject?.(saved));
    },
    [onSaveProject],
  );

  const {
    form,
    errors,
    isSaving,
    setField,
    toggleCategoryTag,
    toggleResearchField,
    toggleFacultyUnit,
    setProductCount,
    setProgressReportDate,
    submit,
    cancel,
  } = useDataEntryForm({
    mode,
    initialProject: project,
    onSaved: handleSaved,
    onCancelRequest: onCancel,
  });

  const handleSave = async () => {
    const result = await submit();
    if (result.ok) {
      notify(mode === 'edit' ? 'Đã cập nhật đề tài thành công.' : 'Đã lưu đề tài mới thành công.');
      return;
    }
    notify(result.message);
  };

  const content = (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <FormHeader
        mode={mode}
        projectStatus={form.projectStatus}
        onProjectStatusChange={(status) => setField('projectStatus', status)}
        onCancel={cancel}
        onSave={() => void handleSave()}
        isSaving={isSaving}
      />

      <div className="space-y-0 px-6 py-6 sm:px-8">
        <ContractSection form={form} errors={errors} setField={setField} />
        <GeneralInfoSection
          form={form}
          errors={errors}
          setField={setField}
          toggleCategoryTag={toggleCategoryTag}
          toggleResearchField={toggleResearchField}
          toggleFacultyUnit={toggleFacultyUnit}
        />
        <DecisionSection form={form} setField={setField} />
        <BudgetSection form={form} setField={setField} />
        <TimelineSection
          form={form}
          setField={setField}
          setProgressReportDate={setProgressReportDate}
        />
        <ResultsSection form={form} setField={setField} />
        <ProductDetailSection form={form} setField={setField} setProductCount={setProductCount} />
        <OtherInfoSection form={form} errors={errors} setField={setField} />
      </div>
    </div>
  );

  return (
    <>
      <div className={embedded ? '' : 'mx-auto max-w-7xl px-0 pb-20 pt-0'}>{content}</div>
      <Toast message={message} onDismiss={dismiss} />
    </>
  );
}
