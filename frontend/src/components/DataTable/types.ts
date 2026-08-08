export enum ProjectStatus {
  NEW_REGISTRATION = 'Đăng ký mới',
  ONGOING = 'Đang thực hiện',
  ACCEPTANCE = 'Nghiệm thu',
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

export type ProjectMember = {
  id: string;
  fullName: string;
  academicTitle: string;
  nationalId: string;
  email: string;
  workUnit: string;
  projectRole: string;
};

export type ProjectLeader = {
  id: string;
  fullName: string;
  academicTitle: string;
  nationalId: string;
  email: string;
  workUnit: string;
  projectRole: string;
  birthYear: string;
  /** Empty for primary leader; `co_leader` | `replacement` for additional leaders. */
  addReason: '' | 'co_leader' | 'replacement';
};

export type HistoryFieldChange = {
  field: string;
  label: string;
  oldValue: string;
  newValue: string;
};

export type HistoryEntry = {
  timestamp: string;
  user: string;
  action: string;
  /** Field-level before/after values when the action edited project data. */
  changes?: HistoryFieldChange[];
};

export type ProjectDiscussionNote = {
  id: string;
  content: string;
  author: string;
  authorId?: string;
  createdAt: string;
  updatedAt?: string;
  /** User ids who liked this comment. */
  likedBy?: string[];
  /** When set, this comment is a reply to another note. */
  parentId?: string;
  /** User ids explicitly @mentioned in the comment. */
  mentionedUserIds?: string[];
};

export type ProjectNoteNotification = {
  id: string;
  noteId: string;
  forUserId: string;
  projectId: string;
  projectTitle: string;
  message: string;
  read: boolean;
  createdAt: string;
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
  contractAppendix?: string;
  contractDate?: string;
  certificateResultNumber?: string;
  certificateResultDate?: string | number;
  certificateResultIssuingAuthority?: string;
  leadAuthor: string;
  principalEmail?: string;
  leadAuthorBirthYear?: string;
  leadAuthorGender?: string;
  /** Structured leader rows; `leadAuthor` / `leadAuthorBirthYear` stay in sync with the primary leader. */
  leaderDetails?: ProjectLeader[];
  members?: string;
  /** Structured member rows from data entry; `members` keeps a display string of names. */
  memberDetails?: ProjectMember[];
  department: string;
  subDepartment?: string;
  researchField: string;
  researchType?: string;
  categories?: string[] | string;
  approvalDecision?: string;
  authorizationDecision?: string;
  appraisalDecision?: string;
  acceptanceDecision?: string;
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
  supervisorId?: string;
  /** Free-text notes from data-entry §8. */
  generalNotes?: string;
  projectNotes?: ProjectDiscussionNote[];
  noteNotifications?: ProjectNoteNotification[];
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
  onDelete: (id: string) => void | boolean | Promise<void | boolean>;
  onEdit: (project: ResearchProject) => void;
  onView: (project: ResearchProject) => void;
  onImport?: (data: Partial<ResearchProject>[], file?: File) => void | Promise<void>;
  onImportFeedback?: (result: ImportFeedback) => void;
  onDeleteMultiple?: (ids: string[]) => void | Promise<void>;
  onDeleteAll?: () => void | Promise<void>;
  /** When false, hide RESET and all delete actions (e.g. chuyên viên). Default true. */
  canDeleteProjects?: boolean;
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
