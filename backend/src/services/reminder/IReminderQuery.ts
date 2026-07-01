export type ProjectRecipient = {
  projectId: string;
  projectTitle: string;
  deadlineDate: Date;
  leader: {
    email: string;
    name: string;
  };
  specialists: Array<{
    email: string;
    name: string;
  }>;
};

export interface IReminderQuery {
  getProjectsWithReportDeadlineIn1Month(): Promise<ProjectRecipient[]>;
  getProjectsWithAcceptanceExpiryIn3Months(): Promise<ProjectRecipient[]>;
  getProjectsWithAcceptanceExpiryIn1Month(): Promise<ProjectRecipient[]>;
}
