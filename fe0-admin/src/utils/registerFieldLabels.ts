const ACADEMIC_LABELS: Record<string, string> = {
  gs: 'Giáo sư',
  pgsts: 'Phó Giáo sư, Tiến sĩ',
  ts: 'Tiến sĩ',
  ths: 'Thạc sĩ',
  bsck2: 'Bác sĩ Chuyên khoa II',
  bsck1: 'Bác sĩ Chuyên khoa I',
  other: 'Khác',
};

const REQUESTED_ROLE_LABELS: Record<string, string> = {
  specialist: 'Chuyên viên',
  applicant: 'Người nộp đề tài',
  leader: 'Lãnh đạo',
};

export function academicRankLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return ACADEMIC_LABELS[value] ?? value;
}

export function requestedRolesLabel(roles: string[] | null | undefined): string {
  if (!roles || roles.length === 0) return '—';
  return roles.map((role) => REQUESTED_ROLE_LABELS[role] ?? role).join(', ');
}

export function displayOrDash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '—';
}
