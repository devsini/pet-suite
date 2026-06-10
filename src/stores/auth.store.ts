import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { UserRole } from '@/types';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
}

interface AuthState {
  user: AuthUser | null;
  role: UserRole | null;
  session: Session | null;
  isInitializing: boolean;
  setUser: (user: AuthUser) => void;
  setSession: (session: Session | null) => void;
  setInitializing: (isInitializing: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  session: null,
  isInitializing: true,
  setUser: (user) => set({ user, role: user.role }),
  setSession: (session) => set({ session }),
  setInitializing: (isInitializing) => set({ isInitializing }),
  clearAuth: () => set({ user: null, role: null, session: null })
}));
