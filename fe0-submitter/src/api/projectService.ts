import type { SubmitterProject } from '../types/submitter.js';
import {
  getSubmitterEmailCandidates,
  projectEmailMatchesSubmitter,
} from '../utils/submitterEmail.js';
import { httpClient } from './httpClient.js';

type SubmitterIdentity = {
  id: string;
  username: string;
  email?: string | null;
};

/** Sample data when the API is unavailable — scoped to the submitter email. */
export function getDemoProjects(identity: SubmitterIdentity): SubmitterProject[] {
  const principalEmail = getSubmitterEmailCandidates(identity)[0];

  return [
    {
      id: 'demo-approved-1',
      title: 'Ứng dụng AI trong nghiên cứu khoa học và',
      level: 'cấp cơ sở',
      durationMonths: 24,
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      submittedBy: identity.id,
      principalEmail,
    },
  ];
}

/**
 * Fetch projects owned by the current submitter (matched by institutional email).
 * Falls back to demo data only when the API request fails.
 */
export async function fetchMyProjects(identity: SubmitterIdentity): Promise<SubmitterProject[]> {
  const submitterEmails = getSubmitterEmailCandidates(identity);

  try {
    const { data } = await httpClient.get<Record<string, unknown>[]>('/research-projects');
    if (!Array.isArray(data)) {
      return getDemoProjects(identity);
    }

    return data
      .map((raw) => mapApiProjectToSubmitter(raw, submitterEmails))
      .filter(Boolean) as SubmitterProject[];
  } catch {
    return getDemoProjects(identity);
  }
}

function mapApiProjectToSubmitter(
  raw: Record<string, unknown>,
  submitterEmails: string[],
): SubmitterProject | null {
  const id = String(raw.id ?? '');
  const title = String(raw.title ?? '').trim();
  if (!id || !title) return null;

  const principalEmail = raw.principalEmail ? String(raw.principalEmail) : undefined;
  if (!projectEmailMatchesSubmitter(principalEmail, submitterEmails)) {
    return null;
  }

  const durationMonths = parseDurationMonths(raw.duration);
  const status = mapApprovalStatus(raw);

  return {
    id,
    title,
    projectCode: raw.projectCode ? String(raw.projectCode) : undefined,
    level: String(raw.researchType ?? raw.department ?? 'cấp cơ sở'),
    durationMonths,
    status,
    createdAt: new Date().toISOString(),
    submittedBy: String(raw.submittedBy ?? raw.leadAuthor ?? ''),
    principalEmail,
  };
}

function parseDurationMonths(duration: unknown): number {
  if (typeof duration === 'number' && Number.isFinite(duration)) return duration;
  if (typeof duration === 'string') {
    const match = duration.match(/(\d+)/);
    if (match) return Number(match[1]);
  }
  return 24;
}

function mapApprovalStatus(raw: Record<string, unknown>): SubmitterProject['status'] {
  const explicit = raw.submitterStatus ?? raw.approvalStatus;
  if (typeof explicit === 'string') {
    const upper = explicit.toUpperCase();
    if (upper === 'DRAFT' || upper === 'PENDING' || upper === 'APPROVED' || upper === 'REJECTED') {
      return upper;
    }
  }
  return 'APPROVED';
}
