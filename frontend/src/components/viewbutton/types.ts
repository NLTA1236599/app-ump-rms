import type { ResearchProject } from '../DataTable/types.js';

export type WorkflowHistoryEntry = {
  step: number;
  updatedAt: string;
  user: string;
  isRevert?: boolean;
};

export type StepDates = {
  expectedStart?: string;
  expectedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
};

export type WorkflowTodo = {
  step: number;
  dates: StepDates;
};

export type WorkflowStepDef = {
  step: number;
  label: string;
};

export type StepStatus = 'completed' | 'current' | 'upcoming';

export type ProjectDetailProps = {
  project: ResearchProject;
  userEmail: string;
  onBack: () => void;
  onUpdate: () => void;
  onEdit: (project: ResearchProject) => void;
  /** Persists mutations to the parent store (client-side until DB API exists). */
  onPersist?: (project: ResearchProject) => void;
};

export type WorkflowTimelineProps = {
  project: ResearchProject;
  currentStep: number;
  history?: WorkflowHistoryEntry[];
  projectTodos?: WorkflowTodo[];
  projectStartDate?: string | number | null;
  projectEndDate?: string | number | null;
  onStepClick?: (step: number) => void;
  disabled?: boolean;
};

export type WorkflowTodoListProps = {
  project: ResearchProject;
  step: number;
  onUpdate: () => void;
  onPersist?: (project: ResearchProject) => void;
  disabled?: boolean;
};

export type InfoFieldProps = {
  label: string;
  value: unknown;
  isEditing?: boolean;
  type?: string;
  onChange?: (val: string) => void;
  className?: string;
  isCurrency?: boolean;
  isDate?: boolean;
};
