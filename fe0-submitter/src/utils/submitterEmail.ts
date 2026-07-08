import { normalizeInstitutionalEmailInput } from './institutionalEmail.js';

type SubmitterIdentity = {
  id: string;
  username: string;
  email?: string | null;
  displayName?: string | null;
};

const INSTITUTIONAL_EMAIL_PATTERN = /[\w.+-]+@(?:ump|umc)\.edu\.vn/gi;

/** Normalized email candidates for the logged-in submitter account. */
export function getSubmitterEmailCandidates(user: SubmitterIdentity): string[] {
  if (user.email?.trim()) {
    return [normalizeInstitutionalEmailInput(user.email)];
  }

  const username = user.username.trim();
  if (username.includes('@')) {
    return [normalizeInstitutionalEmailInput(username)];
  }

  const local = username.toLowerCase();
  return ['@ump.edu.vn', '@umc.edu.vn'].map((domain) =>
    normalizeInstitutionalEmailInput(`${local}${domain}`),
  );
}

export function resolveSubmitterEmail(user: SubmitterIdentity): string {
  return getSubmitterEmailCandidates(user)[0] ?? '';
}

export function projectEmailMatchesSubmitter(
  projectEmail: string | undefined | null,
  submitterEmails: string[],
): boolean {
  const normalizedProject = projectEmail?.trim()
    ? normalizeInstitutionalEmailInput(projectEmail)
    : '';
  if (!normalizedProject) return false;

  return submitterEmails.some(
    (candidate) => normalizeInstitutionalEmailInput(candidate) === normalizedProject,
  );
}

function extractProjectEmails(raw: Record<string, unknown>): string[] {
  const emails = new Set<string>();

  if (raw.principalEmail) {
    emails.add(normalizeInstitutionalEmailInput(String(raw.principalEmail)));
  }

  const leadAuthor = String(raw.leadAuthor ?? '');
  for (const match of leadAuthor.matchAll(INSTITUTIONAL_EMAIL_PATTERN)) {
    emails.add(normalizeInstitutionalEmailInput(match[0]));
  }

  return [...emails];
}

/** True when the project belongs to the logged-in submitter account. */
export function projectBelongsToSubmitter(
  raw: Record<string, unknown>,
  identity: SubmitterIdentity,
  submitterEmails: string[],
): boolean {
  const projectEmails = extractProjectEmails(raw);
  if (projectEmails.some((email) => projectEmailMatchesSubmitter(email, submitterEmails))) {
    return true;
  }

  const createdBy = raw.created_by ?? raw.createdBy ?? raw.submittedBy;
  if (createdBy && String(createdBy) === identity.id) {
    return true;
  }

  const leadAuthor = String(raw.leadAuthor ?? '').trim().toLowerCase();
  const displayName = identity.displayName?.trim().toLowerCase();
  if (leadAuthor && displayName && leadAuthor === displayName) {
    return true;
  }

  return false;
}
