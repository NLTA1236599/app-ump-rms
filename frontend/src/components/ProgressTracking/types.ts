export type ColumnId = 'review' | 'report' | 'pre_acceptance' | 'completed';

export type KanbanColumnTheme = {
  bg: string;
  border: string;
  title: string;
  badgeBorder: string;
  dashedBtn: string;
  hoverBtn: string;
  modalHeader: string;
};

export type ColumnConfig = {
  id: ColumnId;
  label: string;
  theme: KanbanColumnTheme;
};

export type KanbanTask = {
  id: string;
  columnId: ColumnId;
  title: string;
  owner: string;
  unit: string;
  /** Display string `dd/mm/yyyy` */
  dueDate: string;
  note?: string;
  categories?: string[];
};

export type NewTaskDraft = Omit<KanbanTask, 'id'>;

export type AnnouncementTone = 'notice' | 'event' | 'guide' | 'overdue' | 'pre_acceptance';

export type AnnouncementItem = {
  id: string;
  tag: string;
  tone: AnnouncementTone;
  title: string;
  /** `Date` value shown with `vi-VN` short month */
  at: Date;
};
