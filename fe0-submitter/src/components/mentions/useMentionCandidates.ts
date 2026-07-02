import { useMemo } from 'react';

import { useAssignableUsers } from '../../hooks/useAssignableUsers.js';

import { toMentionCandidate } from './mentionUtils.js';
import type { MentionCandidate } from './mentionTypes.js';

export function useMentionCandidates(excludeUserId?: string): MentionCandidate[] {
  const users = useAssignableUsers(true);

  return useMemo(
    () =>
      users
        .filter((user) => user.id !== excludeUserId)
        .map(toMentionCandidate)
        .sort((a, b) => a.label.localeCompare(b.label, 'vi')),
    [excludeUserId, users],
  );
}
