import { createContext, useContext, type ReactNode } from 'react';

import { useAuthContext } from '../../contexts/AuthContext.js';
import type { ResearchProject } from '../DataTable/types.js';

import { useNotificationProjects } from './useNotificationProjects.js';

export type NotificationNavigationHandlers = {
  onViewProject: (projectId: string) => void;
  onShowAllNotifications: () => void;
};

type NotificationContextValue = NotificationNavigationHandlers & {
  projects: ResearchProject[];
  loading: boolean;
  error: string | null;
  userId?: string;
  refetch: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

type NotificationProviderProps = NotificationNavigationHandlers & {
  children: ReactNode;
};

export function NotificationProvider({
  children,
  onViewProject,
  onShowAllNotifications,
}: NotificationProviderProps) {
  const { user } = useAuthContext();
  const { projects, loading, error, refetch } = useNotificationProjects();

  return (
    <NotificationContext.Provider
      value={{
        projects,
        loading,
        error,
        userId: user?.id,
        refetch,
        onViewProject,
        onShowAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return ctx;
}
