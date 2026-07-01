import { create } from 'zustand';

import type { AdminSession } from '../types/index.js';

const STORAGE_KEY = 'admin_user';

function readStoredUser(): AdminSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

type AuthStore = {
  user: AdminSession | null;
  setUser: (user: AdminSession) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: readStoredUser(),

  setUser: (user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null });
  },
}));
