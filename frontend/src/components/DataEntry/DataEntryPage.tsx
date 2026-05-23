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

/** Full-page form body — DataEntryfinal-spec.md */
export function DataEntryPage() {
  const {
    form,
    errors,
    isSaving,
    setField,
    toggleCategoryTag,
    setProductCount,
    setProgressReportDate,
    submit,
    cancel,
  } = useDataEntryForm();

  return (
    <div className="mx-auto max-w-7xl px-0 pb-20 pt-0">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <FormHeader
          projectStatus={form.projectStatus}
          onProjectStatusChange={(status) => setField('projectStatus', status)}
          onCancel={cancel}
          onSave={() => void submit()}
          isSaving={isSaving}
        />

        <div className="space-y-0 px-6 py-6 sm:px-8">
          <ContractSection form={form} errors={errors} setField={setField} />
          <GeneralInfoSection
            form={form}
            errors={errors}
            setField={setField}
            toggleCategoryTag={toggleCategoryTag}
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
          <OtherInfoSection form={form} setField={setField} />
        </div>
      </div>
    </div>
  );
}
