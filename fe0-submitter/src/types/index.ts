export interface User {
  id: string;
  username: string;
  role: string;
  displayName?: string | null;
}

export type AuthUser = {
  id: string;
  username: string;
  role: string;
  displayName?: string | null;
};

export type SubmitterSession = AuthUser & {
  token: string;
  /** Full institutional email from login (e.g. user@ump.edu.vn). */
  email?: string | null;
};

export type {
  SubmitterProject,
  SubmitterProjectStatus,
  StatusFilterId,
} from './submitter.js';
