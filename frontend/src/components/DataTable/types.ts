export enum ProjectStatus {
  ONGOING = 'Đang thực hiện',
  COMPLETED = 'Đã nghiệm thu',
  OVERDUE = 'Trễ hạn',
  LIQUIDATED = 'Thanh lý',
  PAUSED = 'Tạm dừng',
}

export enum ProgressStatus {
  ON_TIME = 'Đúng hạn',
  OVERDUE = 'Trễ hạn',
  EXTENDED = 'Gia hạn',
}

export type ProductEntry = {
  type: string;
  count: number;
};

export type HistoryEntry = {
  timestamp: string;
  user: string;
  action: string;
};

export type WorkflowHistoryEntry = {
  step: number;
  updatedAt: string;
  user: string;
  isRevert?: boolean;
};

export type WorkflowStepDates = {
  expectedStart?: string;
  expectedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
};

export type WorkflowTodo = {
  step: number;
  dates: WorkflowStepDates;
};

export type ResearchProject = {
  id: string;
  title: string;
  contractId: string;
  contractDate?: string;
  certificateResultNumber?: string;
  certificateResultDate?: string | number;
  certificateResultIssuingAuthority?: string;
  leadAuthor: string;
  leadAuthorBirthYear?: string;
  leadAuthorGender?: string;
  members?: string;
  department: string;
  subDepartment?: string;
  researchField: string;
  researchType?: string;
  categories?: string[] | string;
  approvalDecision?: string;
  authorizationDecision?: string;
  budget: number;
  budgetLumpSum?: number;
  budgetNonLumpSum?: number;
  budgetOtherSources?: number;
  budgetBatch1?: number;
  budgetBatch2?: number;
  budgetBatch3?: number;
  duration?: string;
  startDate?: string | number | null;
  endDate?: string | number | null;
  extensionDate?: string | number | null;
  reviewReportingDate?: string | number | null;
  progressReportDate1?: string | number | null;
  progressReportDate2?: string | number | null;
  progressReportDate3?: string | number | null;
  progressReportDate4?: string | number | null;
  progressStatus?: string;
  progressReportNote?: string;
  acceptanceMeetingDate?: string | number | null;
  outputProduct?: string;
  status: ProjectStatus | string;
  acceptanceYear?: string;
  acceptanceAcademicYear?: string;
  expectedProducts?: ProductEntry[];
  actualProducts?: ProductEntry[];
  actualProductDetails?: string;
  reminderDate?: string | number | null;
  acceptanceCompletionDate?: string | number | null;
  projectCode?: string;
  isTransferred?: boolean;
  terminationReason?: string;
  history?: HistoryEntry[];
  workflowStep?: number;
  workflowHistory?: WorkflowHistoryEntry[];
  workflowTodos?: WorkflowTodo[];
};

export type ColumnFilters = Record<string, string>;

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type ImportFeedback =
  | { ok: true; count: number }
  | { ok: false; message: string };

export type DataTableProps = {
  projects: ResearchProject[];
  onDelete: (id: string) => void;
  onEdit: (project: ResearchProject) => void;
  onView: (project: ResearchProject) => void;
  onImport?: (data: Partial<ResearchProject>[]) => void;
  onImportFeedback?: (result: ImportFeedback) => void;
  onDeleteMultiple?: (ids: string[]) => void;
  onDeleteAll?: () => void;
};

export type FilterableHeaderProps = {
  label: string;
  colId: string;
  minWidth?: string;
  className?: string;
  columnFilters: ColumnFilters;
  activeFilterColumn: string | null;
  onToggleFilter: (colId: string) => void;
  onFilterChange: (colId: string, value: string) => void;
  onCloseFilter: () => void;
};
