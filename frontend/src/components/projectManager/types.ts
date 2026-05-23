/** Sản phẩm đề tài (JSON trong mẫu gốc). */
export type ProjectProductEntry = {
  type: string;
  count?: number;
};

export enum ProjectStatus {
  ONGOING = 'Đang thực hiện',
  COMPLETED = 'Đã nghiệm thu',
  OVERDUE = 'Trễ hạn',
  LIQUIDATED = 'Thanh lý',
}

export enum ProgressStatus {
  EXTENDED = 'Gia hạn',
}

export type ResearchProject = {
  id: string;
  department: string;
  status: ProjectStatus | string;
  researchField: string;
  researchType?: string;
  progressStatus?: string;
  categories?: string;
  startDate?: string | null;
  endDate?: string | null;
  budget: number;
  expectedProducts?: ProjectProductEntry[] | string | null;
  actualProducts?: ProjectProductEntry[] | string | null;
};

export type ProjectFilterState = {
  startYear: string;
  status: string;
  researchField: string;
  department: string;
};

export type DynChartType = 'bar' | 'line' | 'pie';
export type DynYAxis = 'count' | 'budget';
