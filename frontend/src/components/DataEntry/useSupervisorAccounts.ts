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

/** Login id is the institutional email for new accounts; legacy rows are local-part only. */
export function supervisorAccountEmail(user: User): string {
  const username = user.username.trim();
  if (!username) return '';
  if (username.includes('@')) return username;
  return `${username}@ump.edu.vn`;
}

export function resolveSupervisorEmail(
  supervisorId: string | undefined,
  emailById: ReadonlyMap<string, string>,
): string {
  const id = supervisorId?.trim();
  if (!id) return '';
  return emailById.get(id) ?? '';
}

export function supervisorEmailByIdMap(users: readonly User[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const user of users) {
    map.set(user.id, supervisorAccountEmail(user));
  }
  return map;
}

/** All assignable accounts, keyed for table/export lookup (not limited to supervisor roles). */
export function useSupervisorEmailLookup(): Map<string, string> {
  const users = useAssignableUsers(true);
  return useMemo(() => supervisorEmailByIdMap(users), [users]);
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
