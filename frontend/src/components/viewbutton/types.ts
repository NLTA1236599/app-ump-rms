import type { ResearchProject } from '../DataTable/types.js';

export type WorkflowStepDef = {
  step: number;
  label: string;
};

export type ProjectDetailProps = {
  project: ResearchProject;
  onBack: () => void;
  onEdit: (project: ResearchProject) => void;
  onDelete?: (id: string) => void | Promise<void>;
  onUpdateProject?: (project: ResearchProject) => void | Promise<void>;
  /** Updates local project cache without a write (e.g. after polling). */
  onSyncProject?: (project: ResearchProject) => void;
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
