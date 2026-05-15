import { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth.js';

type AuthLoginResult = Awaited<ReturnType<ReturnType<typeof useAuth>['login']>>;

interface AuthContextValue {
  user: ReturnType<typeof useAuth>['user'];
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthLoginResult>;
  logout: ReturnType<typeof useAuth>['logout'];
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
