/** Sản phẩm đề tài (JSON trong mẫu gốc). */
export type ProjectProductEntry = {
  type: string;
  count?: number;
};

export enum ProjectStatus {
  NEW_REGISTRATION = 'Đăng ký mới',
  ONGOING = 'Đang thực hiện',
  ACCEPTANCE = 'Nghiệm thu',
  COMPLETED = 'Đã nghiệm thu',
  OVERDUE = 'Trễ hạn',
  LIQUIDATED = 'Thanh lý',
}

export enum ProgressStatus {
  EXTENDED = 'Gia hạn',
}

export type ResearchProject = {
  id: string;
  title?: string;
  leadAuthor?: string;
  department: string;
  status: ProjectStatus | string;
  researchField: string;
  researchType?: string;
  progressStatus?: string;
  categories?: string;
  startDate?: string | null;
  endDate?: string | null;
  acceptanceAcademicYear?: string;
  /** Review round, e.g. `Đợt 1/2025`. */
  reviewBatch?: string;
  budget: number;
  /** Kinh phí khoán (nguồn ĐHYD). */
  budgetLumpSum?: number;
  /** Kinh phí không khoán (nguồn ĐHYD). */
  budgetNonLumpSum?: number;
  /** Kinh phí nguồn khác (không phải ĐHYD). */
  budgetOtherSources?: number;
  workflowStep?: number;
  expectedProducts?: ProjectProductEntry[] | string | null;
  actualProducts?: ProjectProductEntry[] | string | null;
};

export type ProjectFilterState = {
  startYear: string;
  academicYear: string;
  status: string;
  researchField: string;
  projectType: string;
  department: string;
  reviewBatch: string;
};

export type DynChartType = 'bar' | 'line' | 'pie';
export type DynYAxis = 'count' | 'budget';
