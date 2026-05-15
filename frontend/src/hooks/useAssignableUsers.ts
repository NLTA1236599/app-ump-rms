import { useEffect, useState } from 'react';
import { userDirectory } from '../services/index.js';
import type { User } from '../types/index.js';

export function useAssignableUsers(enabled: boolean) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    userDirectory
      .listAssignable()
      .then((rows) => {
        if (!cancelled) setUsers(rows);
      })
      .catch(() => {
        if (!cancelled) setUsers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return users;
}
