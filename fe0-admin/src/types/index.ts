export type UserRole = 'admin' | 'leader' | 'specialist' | 'user';

export type AuthUser = {
  id: string;
  username: string;
  role: string;
  displayName?: string | null;
};

export type AdminSession = AuthUser & {
  token: string;
};

export type AdminUserRow = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  allowed_units: string[];
  allowed_project_types: string[];
  email_verified: boolean;
  created_at: string;
  staff_id: string | null;
  phone: string | null;
  academic_rank: string | null;
  work_unit: string | null;
  job_title: string | null;
  requested_roles: string[];
};

export type FeaturePermission = {
  feature: string;
  label?: string;
  allowed_roles: string[];
};
