import type { FormErrors } from './types.js';

const FIELD_ELEMENT_IDS: Partial<Record<keyof FormErrors, string>> = {
  contractNumber: 'contract-number',
  contractSignedAt: 'contract-signed-at',
  contractAppendix: 'contract-appendix',
  contractAppendixSignedAt: 'contract-appendix-signed-at',
  projectCode: 'project-code',
  title: 'title',
  principalInvestigator: 'leaders-editor',
  leaders: 'leaders-editor',
  categoryTags: 'category-tags',
  facultyUnits: 'faculty-units',
  reviewBatch: 'review-batch',
};

export function scrollToFirstFormError(errors: FormErrors): void {
  const firstKey = Object.keys(errors)[0] as keyof FormErrors;
  const elementId = FIELD_ELEMENT_IDS[firstKey];
  if (!elementId) return;

  document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
