import type { ResearchProject } from '../DataTable/types.js';
import { ProjectStatus as TableProjectStatus } from '../DataTable/types.js';

import { allowsCoPrincipal, type Gender, type ProjectStatus } from './constants.js';
import {
  normalizeLeaders,
  primaryLeaderBirthYear,
  primaryLeaderDepartment,
  primaryLeaderEmail,
  primaryLeaderName,
} from './projectLeaders.js';
import { membersToDisplayString, normalizeMembers } from './projectMembers.js';
import {
  composeContractAppendix,
  defaultAppendixYear,
  getFormAppendices,
  composeContractNumber,
  resolveContractSeq,
  resolveContractYear,
} from './contractNumberFormat.js';
import {
  composeProjectCode,
  resolveProjectCodeSeq,
  resolveProjectCodeUnit,
  resolveProjectCodeYear,
} from './projectCodeFormat.js';
import {
  deriveActualProductsFromDetail,
  deriveExpectedProductsFromDetail,
  hasProductDetailData,
  isTypeIIIRowEmpty,
  isTypeIIRowEmpty,
  isTypeIRowEmpty,
} from './productDetailTypes.js';
import type { DataEntryFormData } from './types.js';

function makeProjectId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `pj-${Date.now()}`;
  }
}

const FORM_STATUS_TO_TABLE: Record<ProjectStatus, string> = {
  new_registration: TableProjectStatus.NEW_REGISTRATION,
  in_progress: TableProjectStatus.ONGOING,
  acceptance: TableProjectStatus.ACCEPTANCE,
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
  completed: 'Nghiệm thu',
} as const;

function optionalPositiveInt(raw: string): number | undefined {
  const n = Number(raw.trim());
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

function composeContractId(form: DataEntryFormData, existing?: string): string {
  const composed = composeContractNumber({
    seq: resolveContractSeq(form),
    year: resolveContractYear(form),
    dateIso: form.contractSignedAt,
  });
  return composed || existing || form.contractNumber.trim();
}

function composeProjectCodeValue(form: DataEntryFormData, existing?: string): string {
  const composed = composeProjectCode({
    year: resolveProjectCodeYear(form),
    unit: resolveProjectCodeUnit(form),
    seq: resolveProjectCodeSeq(form),
  });
  return composed || existing || form.projectCode.trim();
}

function composeAppendixValue(form: DataEntryFormData): string | undefined {
  const parts = getFormAppendices(form)
    .filter((item) => item.seq.trim())
    .map((item) =>
      composeContractAppendix({
        seq: item.seq,
        year: item.year.trim() || defaultAppendixYear(form),
        dateIso: item.signedAt,
      }),
    )
    .filter(Boolean);
  if (parts.length > 0) return parts.join('; ');
  return form.contractAppendix.trim() || undefined;
}

export function mapFormToTableProject(
  form: DataEntryFormData,
  existing?: ResearchProject,
): ResearchProject {
  return {
    id: existing?.id ?? makeProjectId(),
    title: form.title.trim(),
    contractId: composeContractId(form, existing?.contractId),
    contractDate: form.contractSignedAt || undefined,
    contractAppendix: composeAppendixValue(form),
    projectCode: composeProjectCodeValue(form, existing?.projectCode),
    certificateResultNumber: form.gcnNumber.trim() || undefined,
    certificateResultDate: form.gcnIssuedAt || undefined,
    certificateResultIssuingAuthority: form.gcnPlace.trim() || undefined,
    leadAuthor:
      primaryLeaderName(form.leaders) || form.principalInvestigator.trim(),
    principalEmail:
      primaryLeaderEmail(form.leaders) || form.principalEmail.trim() || undefined,
    leadAuthorBirthYear:
      primaryLeaderBirthYear(form.leaders) || form.birthYear.trim() || undefined,
    leadAuthorGender: GENDER_LABELS[form.principalGender],
    leaderDetails: (() => {
      const allow = allowsCoPrincipal(form.categoryTags);
      const normalized = normalizeLeaders(form.leaders).map((leader, index) =>
        index === 0 || allow || leader.addReason !== 'co_leader'
          ? leader
          : { ...leader, addReason: 'replacement' as const },
      );
      return normalized.length > 0 ? normalized : undefined;
    })(),
    members: membersToDisplayString(form.members) || undefined,
    memberDetails: (() => {
      const normalized = normalizeMembers(form.members);
      return normalized.length > 0 ? normalized : undefined;
    })(),
    department: form.facultyUnits.join('; '),
    subDepartment:
      primaryLeaderDepartment(form.leaders) || form.department.trim() || undefined,
    researchField: form.researchFields.join('; '),
    researchType: form.researchType.trim() || undefined,
    categories:
      form.categoryTags.includes('Khác') && form.categoryOther.trim()
        ? ['Khác', form.categoryOther.trim()]
        : form.categoryTags,
    approvalDecision: form.decisionReview.trim() || undefined,
    authorizationDecision: form.decisionApprove.trim() || undefined,
    appraisalDecision: form.decisionAppraisal.trim() || undefined,
    acceptanceDecision: form.decisionAcceptance.trim() || undefined,
    budget: Number(form.totalBudget) || 0,
    budgetLumpSum: Number(form.contractedBudget) || 0,
    budgetNonLumpSum: Number(form.nonContractedBudget) || 0,
    budgetOtherSources: Number(form.otherFunding) || 0,
    budgetSettled: Number(form.settledBudget) || 0,
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
    expectedProducts: hasProductDetailData(form)
      ? deriveExpectedProductsFromDetail(form)
      : form.products
          .filter((row) => Number(row.committed) > 0)
          .map((row) => ({ type: row.label, count: Number(row.committed) || 0 })),
    actualProducts: hasProductDetailData(form)
      ? deriveActualProductsFromDetail(form)
      : form.products
          .filter((row) => Number(row.actual) > 0)
          .map((row) => ({ type: row.label, count: Number(row.actual) || 0 })),
    actualProductDetails: form.productActualDetail.trim() || undefined,
    productTypeI: form.productTypeI.filter((row) => !isTypeIRowEmpty(row)),
    productTypeII: form.productTypeII.filter((row) => !isTypeIIRowEmpty(row)),
    productTypeIII: form.productTypeIII.filter((row) => !isTypeIIIRowEmpty(row)),
    trainingResults: form.trainingResults,
    ipProtectionNote: form.ipProtectionNote.trim() || undefined,
    reminderDate: form.reminderAt || undefined,
    acceptanceCompletionDate: form.completionAt || undefined,
    isTransferred: form.transferForward,
    terminationReason: form.liquidationReason.trim() || undefined,
    supervisorId: form.supervisorId.trim() || undefined,
    reviewBatch: form.reviewBatch.trim() || undefined,
    registrationSequenceNumber: optionalPositiveInt(form.sequenceNumber),
    registrationSequenceYear: optionalPositiveInt(form.sequenceYear),
    generalNotes: form.generalNotes.trim() || undefined,
    history: existing?.history ?? [],
    projectNotes: existing?.projectNotes,
    noteNotifications: existing?.noteNotifications,
    workflowStep: existing?.workflowStep,
    workflowHistory: existing?.workflowHistory,
    workflowTodos: existing?.workflowTodos,
  };
}
