export type LeaderAddReason = '' | 'co_leader' | 'replacement';

export const LEADER_ADD_REASON_OPTIONS: Array<{ value: Exclude<LeaderAddReason, ''>; label: string }> =
  [
    { value: 'co_leader', label: 'Đồng chủ nhiệm' },
    { value: 'replacement', label: 'Thay đổi chủ nhiệm' },
  ];

export type ProjectLeader = {
  id: string;
  fullName: string;
  academicTitle: string;
  nationalId: string;
  email: string;
  workUnit: string;
  projectRole: string;
  birthYear: string;
  /** Required when this is an additional leader (index > 0). */
  addReason: LeaderAddReason;
};

export function createEmptyLeader(options?: { requireReason?: boolean }): ProjectLeader {
  const base = {
    fullName: '',
    academicTitle: '',
    nationalId: '',
    email: '',
    workUnit: '',
    projectRole: '',
    birthYear: '',
    addReason: (options?.requireReason ? 'co_leader' : '') as LeaderAddReason,
  };
  try {
    return { id: crypto.randomUUID(), ...base };
  } catch {
    return {
      id: `leader-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...base,
    };
  }
}

export function isLeaderEmpty(leader: ProjectLeader): boolean {
  return (
    !leader.fullName.trim() &&
    !leader.academicTitle.trim() &&
    !leader.nationalId.trim() &&
    !leader.email.trim() &&
    !leader.workUnit.trim() &&
    !leader.projectRole.trim() &&
    !leader.birthYear.trim()
  );
}

export function normalizeLeaders(leaders: ProjectLeader[]): ProjectLeader[] {
  return leaders
    .filter((l) => !isLeaderEmpty(l))
    .map((l, index) => ({
      id: l.id || createEmptyLeader().id,
      fullName: l.fullName.trim(),
      academicTitle: l.academicTitle.trim(),
      nationalId: l.nationalId.trim(),
      email: l.email.trim(),
      workUnit: l.workUnit.trim(),
      projectRole: l.projectRole.trim(),
      birthYear: l.birthYear.trim(),
      addReason: index === 0 ? '' : l.addReason || 'co_leader',
    }));
}

export function primaryLeaderName(leaders: ProjectLeader[]): string {
  const normalized = normalizeLeaders(leaders);
  return normalized[0]?.fullName ?? '';
}

export function primaryLeaderBirthYear(leaders: ProjectLeader[]): string {
  const normalized = normalizeLeaders(leaders);
  return normalized[0]?.birthYear ?? '';
}

export function primaryLeaderEmail(leaders: ProjectLeader[]): string {
  const normalized = normalizeLeaders(leaders);
  return normalized[0]?.email.trim() ?? '';
}

export function leaderAddReasonLabel(reason: LeaderAddReason): string {
  if (reason === 'co_leader') return 'Đồng chủ nhiệm';
  if (reason === 'replacement') return 'Thay đổi chủ nhiệm';
  return 'Chủ nhiệm chính';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function coerceLeader(raw: unknown, index: number): ProjectLeader | null {
  if (!isRecord(raw)) return null;
  const fullName = String(raw.fullName ?? raw.name ?? '').trim();
  const academicTitle = String(raw.academicTitle ?? raw.title ?? '').trim();
  const nationalId = String(raw.nationalId ?? raw.cccd ?? '').trim();
  const email = String(raw.email ?? '').trim();
  const workUnit = String(raw.workUnit ?? raw.unit ?? '').trim();
  const projectRole = String(raw.projectRole ?? raw.role ?? '').trim();
  const birthYear = String(raw.birthYear ?? '').trim();
  const rawReason = String(raw.addReason ?? '').trim();
  const addReason: LeaderAddReason =
    rawReason === 'co_leader' || rawReason === 'replacement'
      ? rawReason
      : index === 0
        ? ''
        : 'co_leader';

  if (
    !fullName &&
    !academicTitle &&
    !nationalId &&
    !email &&
    !workUnit &&
    !projectRole &&
    !birthYear
  ) {
    return null;
  }

  return {
    id: String(raw.id ?? `leader-${index}`),
    fullName,
    academicTitle,
    nationalId,
    email,
    workUnit,
    projectRole,
    birthYear,
    addReason,
  };
}

/** Prefer structured `leaderDetails`; fall back to legacy leadAuthor (+ birth year). */
export function leadersFromProject(
  leaderDetails?: ProjectLeader[] | null,
  legacyLeadAuthor?: string | null,
  legacyBirthYear?: string | null,
): ProjectLeader[] {
  if (Array.isArray(leaderDetails) && leaderDetails.length > 0) {
    const parsed = leaderDetails
      .map((item, index) => coerceLeader(item, index))
      .filter((l): l is ProjectLeader => Boolean(l));
    if (parsed.length > 0) return parsed;
  }

  const name = legacyLeadAuthor?.trim() ?? '';
  if (!name) return [createEmptyLeader()];

  return [
    {
      ...createEmptyLeader(),
      fullName: name,
      birthYear: legacyBirthYear?.trim() ?? '',
      projectRole: 'Chủ nhiệm đề tài',
    },
  ];
}
