import { httpClient } from './httpClient.js';
import type { IIssueService } from '../interfaces/IIssueService.js';
import type { Issue } from '../../types/index.js';

export class ApiIssueService implements IIssueService {
  list(workspaceId: string) {
    return httpClient.get<Issue[]>(`/workspaces/${workspaceId}/issues`);
  }

  create(workspaceId: string, body: Parameters<IIssueService['create']>[1]) {
    return httpClient.post<Issue>(`/workspaces/${workspaceId}/issues`, body);
  }

  patch(workspaceId: string, issueId: string, body: Parameters<IIssueService['patch']>[2]) {
    return httpClient.patch<Issue>(
      `/workspaces/${workspaceId}/issues/${issueId}`,
      body
    );
  }

  async remove(workspaceId: string, issueId: string) {
    await httpClient.delete<void>(`/workspaces/${workspaceId}/issues/${issueId}`);
  }

  reorderBoard(workspaceId: string, items: Parameters<IIssueService['reorderBoard']>[1]) {
    return httpClient.put<Issue[]>(`/workspaces/${workspaceId}/issues/board`, { items });
  }
}
