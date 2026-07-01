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
  created_at: string;
};

export type FeaturePermission = {
  feature: string;
  allowed_roles: string[];
};
