export type ReminderTemplateData = {
  recipientName: string;
  role: string;
  projectTitle: string;
  deadlineDate: string;
  daysOrMonths: string;
};

export interface IEmailTemplate {
  subject(data: ReminderTemplateData): string;
  html(data: ReminderTemplateData): string;
}
