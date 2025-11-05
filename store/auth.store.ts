/**
 * Zustand store for authentication state management
 * This store manages client-side auth state and works in conjunction with TanStack Query
 */

import { create } from "zustand";
import type { AuthUser } from "@/types/api";
import { STORAGE_KEYS } from "@/lib/constants";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  pendingEmail: string | null;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setPendingEmail: (email: string | null) => void;
  clearPendingEmail: () => void;
  signOut: () => void;
  checkAuth: () => boolean;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  pendingEmail: null,

  setUser: (user) => set({ user }),
  
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  
  setPendingEmail: (pendingEmail) => set({ pendingEmail }),
  
  clearPendingEmail: () => set({ pendingEmail: null }),
  
  signOut: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
    set({
      user: null,
      isAuthenticated: false,
      pendingEmail: null,
    });
  },
  
  checkAuth: () => {
    if (typeof window === "undefined") return false;
    const hasToken = Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN));
    const currentAuth = get().isAuthenticated;
    if (hasToken !== currentAuth) {
      set({ isAuthenticated: hasToken });
    }
    return hasToken;
  },
  
  hydrate: () => {
    if (typeof window === "undefined") return;
    const hasToken = Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN));
    const storedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    try {
      const user = storedUser ? JSON.parse(storedUser) : null;
      set({
        isAuthenticated: hasToken,
        user,
      });
    } catch {
      // Invalid stored user data
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  },
}));

