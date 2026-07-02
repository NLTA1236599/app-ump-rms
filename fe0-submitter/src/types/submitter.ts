export type SubmitterProjectStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export type StatusFilterId = 'all' | 'draft' | 'pending' | 'approved' | 'rejected';

export interface SubmitterProject {
  id: string;
  title: string;
  projectCode?: string;
  level: string;
  durationMonths: number;
  status: SubmitterProjectStatus;
  createdAt: string;
  submittedBy: string;
  principalEmail?: string;
}
