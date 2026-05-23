export type RegisterRoleId = 'specialist' | 'applicant';

/** Role card catalogue — `apiRole` is sent to current REST API (server should derive long-term). §10 */
export const REGISTER_ROLE_CARDS: {
  id: RegisterRoleId;
  title: string;
  subtitle: string;
  icon: string;
  apiRole: string;
}[] = [
  {
    id: 'specialist',
    title: 'Chuyên viên',
    subtitle: 'Hỗ trợ thẩm định / xử lý hồ sơ đề tài',
    icon: '🔬',
    apiRole: 'specialist',
  },
  {
    id: 'applicant',
    title: 'Người nộp đề tài',
    subtitle: 'Chủ nhiệm đề tài / Thư ký khoa học',
    icon: '👁',
    apiRole: 'user',
  },
];

export function resolveRegisterApiRole(selected: ReadonlySet<RegisterRoleId>): string {
  const chosen = REGISTER_ROLE_CARDS.filter((c) => selected.has(c.id));
  if (chosen.length === 0) return 'user';
  return chosen[0].apiRole;
}
