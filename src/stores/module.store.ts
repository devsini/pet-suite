import { create } from 'zustand';
import type { ModuleStatus } from '@/types';

interface ModuleState {
  modules: ModuleStatus;
  isLoading: boolean;
  error: string | null;
  setModules: (modules: ModuleStatus) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchModuleStatus: () => Promise<void>;
}

const defaultModules: ModuleStatus = {
  clinic: true,
  monitoring: false,
  inpatient: false,
  grooming: false,
  petshop: false,
  inventory: false,
  accounting: false,
  website: false
};

export const useModuleStore = create<ModuleState>((set) => ({
  modules: defaultModules,
  isLoading: false,
  error: null,
  setModules: (modules) => set({ modules }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  fetchModuleStatus: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/settings/modules');

      if (!response.ok) {
        throw new Error('Unable to fetch module status');
      }

      const data = (await response.json()) as ModuleStatus;
      set({ modules: data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
    }
  }
}));
