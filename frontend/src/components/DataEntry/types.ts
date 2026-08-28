import type { ProjectStatus, ExecutionProgress, Gender } from './constants.js';
import type {
  ProductTypeIRow,
  ProductTypeIIRow,
  ProductTypeIIIRow,
  TrainingResultRow,
} from './productDetailTypes.js';
import type { ProjectLeader } from './projectLeaders.js';
import type { ProjectMember } from './projectMembers.js';

export type { ProjectLeader, ProjectMember };

export type ContractAppendixItem = {
  id: string;
  seq: string;
  year: string;
  signedAt: string;
};

export type DataEntryFormData = {
  /** §1 */
  contractNumber: string;
  contractSeq: string;
  contractYear: string;
  contractSignedAt: string;
  contractAppendix: string;
  contractAppendixSeq: string;
  contractAppendixYear: string;
  contractAppendixSignedAt: string;
  contractAppendices: ContractAppendixItem[];
  projectCode: string;
  gcnNumber: string;
  gcnIssuedAt: string;
  gcnPlace: string;
  /** §2 */
  title: string;
  /** @deprecated Prefer `leaders`; kept in sync for legacy validation/display. */
  principalInvestigator: string;
  /** @deprecated Prefer `leaders[0].birthYear`. */
  birthYear: string;
  leaders: ProjectLeader[];
  members: ProjectMember[];
  researchFields: string[];
  researchType: string;
  categoryTags: string[];
  categoryOther: string;
  department: string;
  facultyUnits: string[];
  /** §3 */
  decisionReview: string;
  decisionApprove: string;
  decisionAppraisal: string;
  decisionAcceptance: string;
  /** §4 */
  totalBudget: string;
  contractedBudget: string;
  nonContractedBudget: string;
  otherFunding: string;
  settledBudget: string;
  installment1: string;
  installment2: string;
  installment3: string;
  /** §5 */
  durationText: string;
  startDate: string;
  endDate: string;
  extensionDate: string;
  bcAssessmentDate: string;
  progressReportDates: [string, string, string, string];
  executionProgress: ExecutionProgress;
  reportSubmissionNote: string;
  meetingNtDate: string;
  /** §6 */
  outputSummary: string;
  projectStatus: ProjectStatus;
  yearNt: string;
  academicYear: string;
  /** §7 */
  products: Array<{ id: string; label: string; committed: string; actual: string }>;
  productActualDetail: string;
  productTypeI: ProductTypeIRow[];
  productTypeII: ProductTypeIIRow[];
  productTypeIII: ProductTypeIIIRow[];
  trainingResults: TrainingResultRow[];
  ipProtectionNote: string;
  /** §8 */
  reminderAt: string;
  completionAt: string;
  principalGender: Gender;
  principalEmail: string;
  supervisorId: string;
  reviewBatch: string;
  sequenceNumber: string;
  sequenceYear: string;
  transferForward: boolean;
  liquidationReason: string;
  generalNotes: string;
};

export type FormErrors = Partial<
  Record<keyof DataEntryFormData | 'categoryTags' | 'leaders', string>
>;
