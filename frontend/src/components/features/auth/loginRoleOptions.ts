export type LoginRoleValue = 'project_lead' | 'specialist' | 'leader' | 'admin';

export const LOGIN_ROLE_OPTIONS: { value: LoginRoleValue; label: string }[] = [
  { value: 'project_lead', label: 'Chủ nhiệm đề tài' },
  { value: 'specialist', label: 'Chuyên viên' },
  { value: 'leader', label: 'Lãnh đạo' },
  { value: 'admin', label: 'Quản trị viên' },
];
