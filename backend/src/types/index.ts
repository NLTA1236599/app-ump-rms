export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: UserRole | string;
  displayName?: string | null;
}

export interface JwtUserPayload {
  id: string;
  username: string;
  role: string;
}

export interface WorkspaceRow {
  id: string;
  key_prefix: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
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
  assignee?: Pick<User, 'id' | 'username' | 'displayName'> | null;
  reporterId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}
