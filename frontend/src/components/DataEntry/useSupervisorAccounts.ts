import { useMemo } from 'react';

import { useAssignableUsers } from '../../hooks/useAssignableUsers.js';
import type { User } from '../../types/index.js';

import { SUPERVISOR_ACCOUNT_ROLES } from './constants.js';

function isSupervisorAccount(user: User): boolean {
  return SUPERVISOR_ACCOUNT_ROLES.includes(
    user.role as (typeof SUPERVISOR_ACCOUNT_ROLES)[number],
  );
}

export function formatSupervisorLabel(user: User): string {
  const name = user.displayName?.trim() || user.username;
  return `${name} (@${user.username})`;
}

/** Supervisor accounts for the §8 single-choice field (admin + specialist roles). */
export function useSupervisorAccounts() {
  const users = useAssignableUsers(true);

  return useMemo(
    () =>
      users
        .filter(isSupervisorAccount)
        .sort((a, b) =>
          formatSupervisorLabel(a).localeCompare(formatSupervisorLabel(b), 'vi'),
        ),
    [users],
  );
}
