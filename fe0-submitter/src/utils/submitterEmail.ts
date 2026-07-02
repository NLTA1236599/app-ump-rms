import { normalizeInstitutionalEmailInput } from './institutionalEmail.js';

type SubmitterIdentity = {
  username: string;
  email?: string | null;
};

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
