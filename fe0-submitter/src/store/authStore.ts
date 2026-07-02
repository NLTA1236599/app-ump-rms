import { create } from 'zustand';

import type { SubmitterSession } from '../types/index.js';

const STORAGE_KEY = 'submitter_user';

function readStoredUser(): SubmitterSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SubmitterSession) : null;
  } catch {
    return null;
  }
}

type AuthStore = {
  user: SubmitterSession | null;
  setUser: (user: SubmitterSession) => void;
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
