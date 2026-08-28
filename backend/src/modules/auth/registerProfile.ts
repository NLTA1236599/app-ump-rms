export type RegisterProfileInput = {
  staffId: string | null;
  phone: string | null;
  academicRank: string | null;
  workUnit: string | null;
  jobTitle: string | null;
  requestedRoles: string[];
};

const ALLOWED_REQUESTED_ROLES = new Set(['specialist', 'applicant', 'leader']);
const ALLOWED_ACADEMIC = new Set(['gs', 'pgsts', 'ts', 'ths', 'bsck2', 'bsck1', 'other']);

function optionalText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function sanitizeRequestedRoles(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(String).filter((role) => ALLOWED_REQUESTED_ROLES.has(role)))];
}

export function emptyRegisterProfile(): RegisterProfileInput {
  return {
    staffId: null,
    phone: null,
    academicRank: null,
    workUnit: null,
    jobTitle: null,
    requestedRoles: [],
  };
}

export function parseRegisterProfile(body: Record<string, unknown> | undefined): RegisterProfileInput {
  const academic = optionalText(body?.academicRank ?? body?.academic, 32);
  return {
    staffId: optionalText(body?.staffId, 64),
    phone: optionalText(body?.phone, 32),
    academicRank: academic && ALLOWED_ACADEMIC.has(academic) ? academic : null,
    workUnit: optionalText(body?.workUnit, 255),
    jobTitle: optionalText(body?.jobTitle, 255),
    requestedRoles: sanitizeRequestedRoles(body?.requestedRoles ?? body?.roles),
  };
}
