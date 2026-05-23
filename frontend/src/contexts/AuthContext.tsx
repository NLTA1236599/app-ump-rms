import { createContext, useContext, type ReactNode } from 'react';
import { useAuth, type AuthLoginResult, type AuthRegisterResult } from '../hooks/useAuth.js';

interface AuthContextValue {
  user: ReturnType<typeof useAuth>['user'];
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthLoginResult>;
  register: (
    username: string,
    password: string,
    role: string,
    displayName?: string
  ) => Promise<AuthRegisterResult>;
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
