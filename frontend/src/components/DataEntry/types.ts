import type { ProjectStatus, ExecutionProgress, Gender } from './constants.js';

export type DataEntryFormData = {
  /** §1 */
  contractNumber: string;
  contractAppendix: string;
  projectCode: string;
  gcnNumber: string;
  gcnIssuedAt: string;
  gcnPlace: string;
  /** §2 */
  title: string;
  principalInvestigator: string;
  birthYear: string;
  members: string;
  researchFields: string[];
  researchType: string;
  categoryTags: string[];
  categoryOther: string;
  department: string;
  facultyUnits: string[];
  /** §3 */
  decisionReview: string;
  decisionApprove: string;
  /** §4 */
  totalBudget: string;
  contractedBudget: string;
  nonContractedBudget: string;
  otherFunding: string;
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
  /** §8 */
  reminderAt: string;
  completionAt: string;
  principalGender: Gender;
  principalEmail: string;
  supervisorId: string;
  transferForward: boolean;
  liquidationReason: string;
  generalNotes: string;
};

export type FormErrors = Partial<Record<keyof DataEntryFormData | 'categoryTags', string>>;
