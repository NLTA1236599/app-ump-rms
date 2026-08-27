export type ProjectMember = {
  id: string;
  fullName: string;
  academicTitle: string;
  nationalId: string;
  email: string;
  workUnit: string;
  department: string;
  projectRole: string;
};

export function createEmptyMember(): ProjectMember {
  const base = {
    fullName: '',
    academicTitle: '',
    nationalId: '',
    email: '',
    workUnit: '',
    department: '',
    projectRole: '',
  };
  try {
    return { id: crypto.randomUUID(), ...base };
  } catch {
    return {
      id: `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...base,
    };
  }
}

export function isMemberEmpty(member: ProjectMember): boolean {
  return (
    !member.fullName.trim() &&
    !member.academicTitle.trim() &&
    !member.nationalId.trim() &&
    !member.email.trim() &&
    !member.workUnit.trim() &&
    !member.department.trim() &&
    !member.projectRole.trim()
  );
}

/** Keep only members with at least one filled field. */
export function normalizeMembers(members: ProjectMember[]): ProjectMember[] {
  return members
    .filter((m) => !isMemberEmpty(m))
    .map((m) => ({
      id: m.id || createEmptyMember().id,
      fullName: m.fullName.trim(),
      academicTitle: m.academicTitle.trim(),
      nationalId: m.nationalId.trim(),
      email: m.email.trim(),
      workUnit: m.workUnit.trim(),
      department: m.department.trim(),
      projectRole: m.projectRole.trim(),
    }));
}

/** Display / Excel / legacy string: comma-separated full names. */
export function membersToDisplayString(members: ProjectMember[]): string {
  return normalizeMembers(members)
    .map((m) => m.fullName || m.email || m.nationalId)
    .filter(Boolean)
    .join(', ');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function coerceMember(raw: unknown, index: number): ProjectMember | null {
  if (!isRecord(raw)) return null;
  const fullName = String(raw.fullName ?? raw.name ?? '').trim();
  const academicTitle = String(raw.academicTitle ?? raw.title ?? '').trim();
  const nationalId = String(raw.nationalId ?? raw.cccd ?? '').trim();
  const email = String(raw.email ?? '').trim();
  const workUnit = String(raw.workUnit ?? raw.unit ?? '').trim();
  const department = String(raw.department ?? raw.subDepartment ?? '').trim();
  const projectRole = String(raw.projectRole ?? raw.role ?? '').trim();
  if (!fullName && !academicTitle && !nationalId && !email && !workUnit && !department && !projectRole) {
    return null;
  }
  return {
    id: String(raw.id ?? `member-${index}`),
    fullName,
    academicTitle,
    nationalId,
    email,
    workUnit,
    department,
    projectRole,
  };
}

/** Prefer structured `memberDetails`; fall back to legacy free-text `members`. */
export function membersFromProject(
  memberDetails?: ProjectMember[] | null,
  legacyMembers?: string | null,
): ProjectMember[] {
  if (Array.isArray(memberDetails) && memberDetails.length > 0) {
    const parsed = memberDetails
      .map((item, index) => coerceMember(item, index))
      .filter((m): m is ProjectMember => Boolean(m));
    if (parsed.length > 0) return parsed;
  }

  const names = (legacyMembers ?? '')
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (names.length === 0) return [createEmptyMember()];

  return names.map((fullName) => ({
    ...createEmptyMember(),
    fullName,
  }));
}
