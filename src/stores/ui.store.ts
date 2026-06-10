import { create } from 'zustand';

interface UIState {
  isSidebarCollapsed: boolean;
  activeTheme: 'light' | 'dark';
  isCommandPaletteOpen: boolean;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  activeTheme: 'light',
  isCommandPaletteOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setTheme: (theme) => set({ activeTheme: theme }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open })
}));
