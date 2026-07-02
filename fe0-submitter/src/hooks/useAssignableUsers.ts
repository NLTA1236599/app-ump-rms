import { useEffect, useState } from 'react';

import { httpClient } from '../api/httpClient.js';
import type { User } from '../types/index.js';

export function useAssignableUsers(enabled: boolean) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    httpClient
      .get<User[]>('/users')
      .then((response) => {
        if (!cancelled) setUsers(response.data);
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
