import type { FormErrors } from './types.js';

const FIELD_ELEMENT_IDS: Partial<Record<keyof FormErrors, string>> = {
  contractNumber: 'contract-number',
  projectCode: 'project-code',
  title: 'title',
  principalInvestigator: 'principal',
  categoryTags: 'category-tags',
  facultyUnits: 'faculty-units',
  principalEmail: 'principal-email',
};

export function scrollToFirstFormError(errors: FormErrors): void {
  const firstKey = Object.keys(errors)[0] as keyof FormErrors;
  const elementId = FIELD_ELEMENT_IDS[firstKey];
  if (!elementId) return;

  document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
