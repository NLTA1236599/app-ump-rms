import { useEffect, useState } from 'react';

import { useAuthContext } from '../contexts/AuthContext.js';
import { getMyFeatures } from '../services/api/featurePermissionService.js';
import { DE_TAI_KHCN_SIDEBAR_ITEMS } from '../components/projectManager/deTaiKhcnSidebarNav.js';

/** Feature ids the current role may open. `null` while loading. */
export function useAllowedFeatures(): Set<string> | null {
  const { user } = useAuthContext();
  const [features, setFeatures] = useState<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setFeatures(new Set());
      return;
    }

    setFeatures(null);
    void getMyFeatures()
      .then((ids) => {
        if (!cancelled) setFeatures(new Set(ids));
      })
      .catch(() => {
        // Network/API failure should not blank the whole menu.
        if (!cancelled) {
          setFeatures(new Set(DE_TAI_KHCN_SIDEBAR_ITEMS.map((item) => item.id)));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role]);

  return features;
}
