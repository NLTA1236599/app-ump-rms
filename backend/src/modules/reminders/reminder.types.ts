export type RecipientRole = 'LEADER' | 'SPECIALIST';

export type DueReminder = {
  projectMilestoneId: string;
  projectId: string;
  milestoneCode: string;
  milestoneName: string;
  dueDate: string; // YYYY-MM-DD
  offsetDays: number;
  projectTitle: string;
  projectCode: string;
};

export type ReminderRecipient = {
  email: string;
  fullName: string;
  role: RecipientRole;
};

export type ReminderRunResult = {
  totalDue: number;
  sent: number;
  skipped: number;
  failed: number;
};
