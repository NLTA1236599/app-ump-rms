import type { ResearchProject } from '../DataTable/types.js';
import { ProjectStatus as TableProjectStatus } from '../DataTable/types.js';

import type { Gender, ProjectStatus } from './constants.js';
import type { DataEntryFormData } from './types.js';

function makeProjectId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `pj-${Date.now()}`;
  }
}

const FORM_STATUS_TO_TABLE: Record<ProjectStatus, string> = {
  in_progress: TableProjectStatus.ONGOING,
  done: TableProjectStatus.COMPLETED,
  liquidated: TableProjectStatus.LIQUIDATED,
  extended_status: TableProjectStatus.PAUSED,
  paused: TableProjectStatus.PAUSED,
};

const GENDER_LABELS: Record<Gender, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
};

const PROGRESS_LABELS = {
  on_time: 'Đúng hạn',
  late: 'Trễ hạn',
  extended: 'Gia hạn',
  completed: 'Hoàn thành',
} as const;

export function mapFormToTableProject(
  form: DataEntryFormData,
  existing?: ResearchProject,
): ResearchProject {
  return {
    id: existing?.id ?? makeProjectId(),
    title: form.title.trim(),
    contractId: form.contractNumber.trim(),
    projectCode: form.projectCode.trim(),
    certificateResultNumber: form.gcnNumber.trim() || undefined,
    certificateResultDate: form.gcnIssuedAt || undefined,
    certificateResultIssuingAuthority: form.gcnPlace.trim() || undefined,
    leadAuthor: form.principalInvestigator.trim(),
    leadAuthorBirthYear: form.birthYear.trim() || undefined,
    leadAuthorGender: GENDER_LABELS[form.principalGender],
    members: form.members.trim() || undefined,
    department: form.facultyUnits.join('; '),
    subDepartment: form.department.trim() || undefined,
    researchField: form.researchFields.join('; '),
    researchType: form.researchType.trim() || undefined,
    categories: form.categoryTags,
    approvalDecision: form.decisionReview.trim() || undefined,
    authorizationDecision: form.decisionApprove.trim() || undefined,
    budget: Number(form.totalBudget) || 0,
    budgetLumpSum: Number(form.contractedBudget) || 0,
    budgetNonLumpSum: Number(form.nonContractedBudget) || 0,
    budgetOtherSources: Number(form.otherFunding) || 0,
    budgetBatch1: Number(form.installment1) || 0,
    budgetBatch2: Number(form.installment2) || 0,
    budgetBatch3: Number(form.installment3) || 0,
    duration: form.durationText.trim() || undefined,
    startDate: form.startDate || undefined,
    endDate: form.endDate || undefined,
    extensionDate: form.extensionDate || undefined,
    reviewReportingDate: form.bcAssessmentDate || undefined,
    progressReportDate1: form.progressReportDates[0] || undefined,
    progressReportDate2: form.progressReportDates[1] || undefined,
    progressReportDate3: form.progressReportDates[2] || undefined,
    progressReportDate4: form.progressReportDates[3] || undefined,
    progressStatus: PROGRESS_LABELS[form.executionProgress],
    progressReportNote: form.reportSubmissionNote.trim() || undefined,
    acceptanceMeetingDate: form.meetingNtDate || undefined,
    outputProduct: form.outputSummary.trim() || undefined,
    status: FORM_STATUS_TO_TABLE[form.projectStatus],
    acceptanceYear: form.yearNt.trim() || undefined,
    acceptanceAcademicYear: form.academicYear.trim() || undefined,
    expectedProducts: form.products
      .filter((row) => Number(row.committed) > 0)
      .map((row) => ({ type: row.label, count: Number(row.committed) || 0 })),
    actualProducts: form.products
      .filter((row) => Number(row.actual) > 0)
      .map((row) => ({ type: row.label, count: Number(row.actual) || 0 })),
    actualProductDetails: form.productActualDetail.trim() || undefined,
    reminderDate: form.reminderAt || undefined,
    acceptanceCompletionDate: form.completionAt || undefined,
    isTransferred: form.transferForward,
    terminationReason: form.liquidationReason.trim() || undefined,
    history: existing?.history ?? [],
  };
}
