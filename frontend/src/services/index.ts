import type { IAuthService } from './interfaces/IAuthService.js';
import type { IWorkspaceService } from './interfaces/IWorkspaceService.js';
import type { IIssueService } from './interfaces/IIssueService.js';
import { ApiAuthService } from './api/authService.js';
import { ApiWorkspaceService } from './api/workspaceService.js';
import { ApiIssueService } from './api/issueService.js';
import { ApiUserDirectory } from './api/userDirectory.js';

export const authService: IAuthService = new ApiAuthService();
export const workspaceService: IWorkspaceService = new ApiWorkspaceService();
export const issueService: IIssueService = new ApiIssueService();
export const userDirectory = new ApiUserDirectory();
