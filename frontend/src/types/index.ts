export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: string;
  displayName?: string | null;
}

export interface Workspace {
  id: string;
  keyPrefix: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type IssueType = 'story' | 'task' | 'bug' | 'epic';
export type IssuePriority = 'lowest' | 'low' | 'medium' | 'high' | 'highest';

export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';

export interface IssueAssigneeBrief {
  id: string;
  username: string;
  displayName: string | null;
}

export interface Issue {
  id: string;
  workspaceId: string;
  issueNumber: number;
  key: string;
  summary: string;
  description: string;
  issueType: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  assigneeId: string | null;
  assignee?: IssueAssigneeBrief | null;
  reporterId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}
