import type { User } from '../../../types/index.js';

import type { ActiveMentionQuery, MentionCandidate } from './mentionTypes.js';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên',
  user: 'Người dùng',
  specialist: 'Chuyên viên',
  leader: 'Lãnh đạo',
};

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

export function toMentionCandidate(user: User): MentionCandidate {
  return {
    id: user.id,
    username: user.username,
    label: user.displayName?.trim() || user.username,
    role: user.role,
  };
}

export function getActiveMentionQuery(text: string, cursor: number): ActiveMentionQuery | null {
  const before = text.slice(0, cursor);
  const match = before.match(/(^|\s)@([\w.-]*)$/);
  if (!match) return null;

  const query = match[2] ?? '';
  const startIndex = cursor - query.length - 1;
  return { query, startIndex };
}

export function filterMentionCandidates(
  candidates: MentionCandidate[],
  query: string,
): MentionCandidate[] {
  const q = query.trim().toLowerCase();
  if (!q) return candidates;

  return candidates.filter(
    (c) =>
      c.username.toLowerCase().includes(q) ||
      c.label.toLowerCase().includes(q) ||
      getRoleLabel(c.role).toLowerCase().includes(q),
  );
}

export function insertMentionAt(
  text: string,
  mentionStart: number,
  cursor: number,
  username: string,
): { text: string; cursor: number } {
  const before = text.slice(0, mentionStart);
  const after = text.slice(cursor);
  const mention = `@${username} `;
  return {
    text: `${before}${mention}${after}`,
    cursor: mentionStart + mention.length,
  };
}

/** Resolve @username tokens in comment text to user ids. */
export function extractMentionedUserIds(
  content: string,
  candidates: MentionCandidate[],
): string[] {
  const ids = new Set<string>();

  for (const candidate of candidates) {
    const pattern = new RegExp(`(^|\\s)@${escapeRegExp(candidate.username)}(?=\\s|$|[.,!?])`, 'g');
    if (pattern.test(content)) {
      ids.add(candidate.id);
    }
  }

  return [...ids];
}

export function buildKnownUsernames(candidates: MentionCandidate[]): Set<string> {
  return new Set(candidates.map((c) => c.username));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export type { ActiveMentionQuery, MentionCandidate };
