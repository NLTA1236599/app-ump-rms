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
  dueDate: string;
  startDate?: string;
  endDate?: string;
  progressPct?: number;
  note?: string;
  categories?: string[];
};

export type AnnouncementTone = 'notice' | 'event' | 'guide' | 'overdue' | 'pre_acceptance';

export type AnnouncementItem = {
  id: string;
  tag: string;
  tone: AnnouncementTone;
  title: string;
  at: Date;
};
