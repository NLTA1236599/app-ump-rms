import type { Issue, IssueStatus } from '../../types/index.js';

export interface IIssueService {
  list(workspaceId: string): Promise<Issue[]>;
  create(
    workspaceId: string,
    body: Partial<{
      summary: string;
      description: string;
      issueType: string;
      priority: string;
      status: IssueStatus;
      assigneeId: string | null;
    }>
  ): Promise<Issue>;
  patch(
    workspaceId: string,
    issueId: string,
    body: Partial<{
      summary: string;
      description: string;
      issueType: string;
      priority: string;
      status: IssueStatus;
      assigneeId: string | null;
      position: number;
    }>
  ): Promise<Issue>;
  remove(workspaceId: string, issueId: string): Promise<void>;
  reorderBoard(
    workspaceId: string,
    items: Array<{ id: string; status: IssueStatus; position: number }>
  ): Promise<Issue[]>;
}
