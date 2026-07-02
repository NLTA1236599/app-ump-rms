import { formatDate } from '../../utils/formatDate.js';
import { ProjectStatus as TableProjectStatus, type ResearchProject } from '../../types/researchProject.js';

import { cloneFormData } from './cloneFormData.js';
import type { ExecutionProgress, Gender, ProjectStatus } from './constants.js';
import { FACULTY_UNIT_OPTIONS, PRODUCT_ROWS, RESEARCH_FIELD_OPTIONS } from './constants.js';
import type { DataEntryFormData } from './types.js';

function toFormIsoDate(value: string | number | null | undefined): string {
  if (value == null || value === '') return '';

  const raw = String(value).trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const formatted = formatDate(value);
  const displayMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(formatted);
  if (displayMatch) {
    return `${displayMatch[3]}-${displayMatch[2]}-${displayMatch[1]}`;
  }

  return '';
}

const TABLE_TO_FORM_STATUS: Record<string, ProjectStatus> = {
  [TableProjectStatus.ONGOING]: 'in_progress',
  [TableProjectStatus.COMPLETED]: 'done',
  [TableProjectStatus.LIQUIDATED]: 'liquidated',
  [TableProjectStatus.OVERDUE]: 'in_progress',
  [TableProjectStatus.PAUSED]: 'paused',
};

function mapTableStatus(status?: string): ProjectStatus {
  return TABLE_TO_FORM_STATUS[status ?? ''] ?? 'in_progress';
}

function mapProgressStatus(status?: string): ExecutionProgress {
  const lower = (status ?? '').toLowerCase();
  if (lower.includes('trễ')) return 'late';
  if (lower.includes('gia hạn')) return 'extended';
  if (lower.includes('hoàn')) return 'completed';
  return 'on_time';
}

function mapGender(gender?: string): Gender {
  if (gender === 'Nữ') return 'female';
  if (gender === 'Khác') return 'other';
  return 'male';
}

function mapCategories(categories?: string[] | string): string[] {
  if (!categories) return [];
  if (Array.isArray(categories)) return categories.filter(Boolean);
  return categories
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapFacultyUnits(value?: string): string[] {
  if (!value?.trim()) return [];

  const trimmed = value.trim();
  if (trimmed.includes(';')) {
    return trimmed
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const exact = FACULTY_UNIT_OPTIONS.find((opt) => opt === trimmed);
  if (exact) return [exact];

  const matched = FACULTY_UNIT_OPTIONS.filter((opt) => trimmed.includes(opt));
  return matched.length ? [...matched] : [];
}

function mapResearchFields(value?: string): string[] {
  if (!value?.trim()) return [];

  const trimmed = value.trim();
  if (trimmed.includes(';')) {
    return trimmed
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const exact = RESEARCH_FIELD_OPTIONS.find((opt) => opt === trimmed);
  if (exact) return [exact];

  const matched = RESEARCH_FIELD_OPTIONS.filter((opt) => trimmed.includes(opt));
  return matched.length ? [...matched] : [];
}

/** Maps a table row into the data-entry form shape for editing. */
export function mapTableToFormData(project: ResearchProject): DataEntryFormData {
  const base = cloneFormData();
  const expectedMap = new Map((project.expectedProducts ?? []).map((p) => [p.type, p.count]));
  const actualMap = new Map((project.actualProducts ?? []).map((p) => [p.type, p.count]));
  const categoryTags = mapCategories(project.categories);

  return {
    ...base,
    contractNumber: project.contractId ?? '',
    contractAppendix: project.contractAppendix ?? '',
    projectCode: project.projectCode ?? '',
    gcnNumber: project.certificateResultNumber ?? '',
    gcnIssuedAt: toFormIsoDate(project.certificateResultDate),
    gcnPlace: project.certificateResultIssuingAuthority ?? '',
    title: project.title ?? '',
    principalInvestigator: project.leadAuthor ?? '',
    birthYear: project.leadAuthorBirthYear ?? '',
    members: project.members ?? '',
    researchFields: mapResearchFields(project.researchField),
    researchType: project.researchType ?? '',
    categoryTags,
    categoryOther: categoryTags.includes('Khác') ? categoryTags.find((t) => t !== 'Khác') ?? '' : '',
    department: project.subDepartment ?? '',
    facultyUnits: mapFacultyUnits(project.department),
    decisionReview: project.approvalDecision ?? '',
    decisionApprove: project.authorizationDecision ?? '',
    totalBudget: String(project.budget ?? 0),
    contractedBudget: String(project.budgetLumpSum ?? 0),
    nonContractedBudget: String(project.budgetNonLumpSum ?? 0),
    otherFunding: String(project.budgetOtherSources ?? 0),
    installment1: String(project.budgetBatch1 ?? 0),
    installment2: String(project.budgetBatch2 ?? 0),
    installment3: String(project.budgetBatch3 ?? 0),
    durationText: project.duration ?? '',
    startDate: toFormIsoDate(project.startDate),
    endDate: toFormIsoDate(project.endDate),
    extensionDate: toFormIsoDate(project.extensionDate),
    bcAssessmentDate: toFormIsoDate(project.reviewReportingDate),
    progressReportDates: [
      toFormIsoDate(project.progressReportDate1),
      toFormIsoDate(project.progressReportDate2),
      toFormIsoDate(project.progressReportDate3),
      toFormIsoDate(project.progressReportDate4),
    ],
    executionProgress: mapProgressStatus(project.progressStatus),
    reportSubmissionNote: project.progressReportNote ?? '',
    meetingNtDate: toFormIsoDate(project.acceptanceMeetingDate),
    outputSummary: project.outputProduct ?? '',
    projectStatus: mapTableStatus(project.status),
    yearNt: project.acceptanceYear ?? '',
    academicYear: project.acceptanceAcademicYear ?? '',
    products: PRODUCT_ROWS.map((row) => ({
      id: row.id,
      label: row.label,
      committed: String(expectedMap.get(row.label) ?? 0),
      actual: String(actualMap.get(row.label) ?? 0),
    })),
    productActualDetail: project.actualProductDetails ?? '',
    reminderAt: toFormIsoDate(project.reminderDate),
    completionAt: toFormIsoDate(project.acceptanceCompletionDate),
    principalGender: mapGender(project.leadAuthorGender),
    principalEmail: String(project.principalEmail ?? ''),
    supervisorId: project.supervisorId ?? '',
    transferForward: Boolean(project.isTransferred),
    liquidationReason: project.terminationReason ?? '',
    generalNotes: '',
  };
}
