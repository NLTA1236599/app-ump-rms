import { formatDate } from '../DataTable/formatDate.js';
import { ProjectStatus as TableProjectStatus, type ResearchProject } from '../DataTable/types.js';

import { cloneFormData } from './cloneFormData.js';
import { parseContractAppendix, parseContractNumber } from './contractNumberFormat.js';
import { extractReviewYear } from './reviewYear.js';
import { looseDdMmYyyyToIso } from './dateHelpers.js';
import type { ExecutionProgress, Gender, ProjectStatus } from './constants.js';
import {
  FACULTY_UNIT_OPTIONS,
  PRODUCT_ROWS,
  PROJECT_TYPE_TAGS,
  RESEARCH_FIELD_OPTIONS,
} from './constants.js';
import {
  createDefaultTrainingResults,
  normalizeTypeIIIRows,
  normalizeTypeIIRows,
  normalizeTypeIRows,
} from './productDetailTypes.js';
import { leadersFromProject, primaryLeaderBirthYear, primaryLeaderName } from './projectLeaders.js';
import { membersFromProject } from './projectMembers.js';
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
  [TableProjectStatus.NEW_REGISTRATION]: 'new_registration',
  [TableProjectStatus.ONGOING]: 'in_progress',
  [TableProjectStatus.ACCEPTANCE]: 'acceptance',
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
  if (lower.includes('nghiệm thu') || lower.includes('hoàn')) return 'completed';
  return 'on_time';
}

function mapGender(gender?: string): Gender {
  if (gender === 'Nữ') return 'female';
  if (gender === 'Khác') return 'other';
  return 'male';
}

function parseCategoryList(categories?: string[] | string): string[] {
  if (!categories) return [];
  if (Array.isArray(categories)) return categories.filter(Boolean);
  return categories
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapCategories(categories?: string[] | string): string[] {
  const raw = parseCategoryList(categories);
  if (raw.length === 0) return [];

  const known = raw.find((tag) =>
    (PROJECT_TYPE_TAGS as readonly string[]).includes(tag),
  );
  return [known ?? raw[0]!];
}

function mapCategoryOther(categories?: string[] | string): string {
  const raw = parseCategoryList(categories);
  if (!raw.includes('Khác')) return '';
  return raw.find((tag) => tag !== 'Khác') ?? '';
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
  const parts = trimmed.includes(';')
    ? trimmed
        .split(';')
        .map((item) => item.trim())
        .filter(Boolean)
    : [trimmed];

  const exact = parts.find((part) =>
    (RESEARCH_FIELD_OPTIONS as readonly string[]).includes(part),
  );
  if (exact) return [exact];

  const matched = RESEARCH_FIELD_OPTIONS.find((opt) =>
    parts.some((part) => part.includes(opt)),
  );
  return matched ? [matched] : [];
}

/** Maps a table row into the data-entry form shape for editing. */
export function mapTableToFormData(project: ResearchProject): DataEntryFormData {
  const base = cloneFormData();
  const expectedMap = new Map((project.expectedProducts ?? []).map((p) => [p.type, p.count]));
  const actualMap = new Map((project.actualProducts ?? []).map((p) => [p.type, p.count]));
  const categoryTags = mapCategories(project.categories);
  const leaders = leadersFromProject(
    project.leaderDetails,
    project.leadAuthor,
    project.leadAuthorBirthYear,
  );
  const legacyDepartment = (project.subDepartment ?? '').trim();
  if (leaders[0] && !leaders[0].department.trim() && legacyDepartment) {
    leaders[0] = { ...leaders[0], department: legacyDepartment };
  }

  const parsed = parseContractNumber(project.contractId);
  const parsedAppendix = parseContractAppendix(project.contractAppendix);
  const sequenceNumber =
    project.registrationSequenceNumber != null ? String(project.registrationSequenceNumber) : '';
  const sequenceYear =
    project.registrationSequenceYear != null ? String(project.registrationSequenceYear) : '';
  const reviewYear = extractReviewYear(project.reviewBatch) ?? extractReviewYear(parsed.year);
  const signedIso =
    toFormIsoDate(project.contractDate) || looseDdMmYyyyToIso(parsed.dateDisplay);

  return {
    ...base,
    contractNumber: project.contractId ?? '',
    contractSeq: sequenceNumber || parsed.seq,
    contractYear: sequenceYear || (reviewYear ? String(reviewYear) : parsed.year),
    contractSignedAt: signedIso,
    contractAppendix: project.contractAppendix ?? '',
    contractAppendixSeq: parsedAppendix.seq,
    contractAppendixYear: parsedAppendix.year,
    contractAppendixSignedAt: looseDdMmYyyyToIso(parsedAppendix.dateDisplay),
    projectCode: project.projectCode ?? '',
    gcnNumber: project.certificateResultNumber ?? '',
    gcnIssuedAt: toFormIsoDate(project.certificateResultDate),
    gcnPlace: project.certificateResultIssuingAuthority ?? '',
    title: project.title ?? '',
    leaders,
    principalInvestigator: primaryLeaderName(leaders) || project.leadAuthor || '',
    birthYear: primaryLeaderBirthYear(leaders) || project.leadAuthorBirthYear || '',
    members: membersFromProject(project.memberDetails, project.members),
    researchFields: mapResearchFields(project.researchField),
    researchType: project.researchType ?? '',
    categoryTags,
    categoryOther: mapCategoryOther(project.categories),
    department: project.subDepartment ?? '',
    facultyUnits: mapFacultyUnits(project.department),
    decisionReview: project.approvalDecision ?? '',
    decisionApprove: project.authorizationDecision ?? '',
    decisionAppraisal: project.appraisalDecision ?? '',
    decisionAcceptance: project.acceptanceDecision ?? '',
    totalBudget: String(project.budget ?? 0),
    contractedBudget: String(project.budgetLumpSum ?? 0),
    nonContractedBudget: String(project.budgetNonLumpSum ?? 0),
    otherFunding: String(project.budgetOtherSources ?? 0),
    settledBudget: String(project.budgetSettled ?? 0),
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
    productTypeI: normalizeTypeIRows(project.productTypeI),
    productTypeII: normalizeTypeIIRows(project.productTypeII),
    productTypeIII: normalizeTypeIIIRows(project.productTypeIII),
    trainingResults: createDefaultTrainingResults(project.trainingResults),
    ipProtectionNote: project.ipProtectionNote ?? '',
    reminderAt: toFormIsoDate(project.reminderDate),
    completionAt: toFormIsoDate(project.acceptanceCompletionDate),
    principalGender: mapGender(project.leadAuthorGender),
    principalEmail: String(project.principalEmail ?? leaders[0]?.email ?? ''),
    supervisorId: project.supervisorId ?? '',
    reviewBatch: project.reviewBatch ?? '',
    sequenceNumber,
    sequenceYear,
    transferForward: Boolean(project.isTransferred),
    liquidationReason: project.terminationReason ?? '',
    generalNotes: project.generalNotes ?? '',
  };
}
