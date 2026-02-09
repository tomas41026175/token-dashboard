import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SourceStore {
  currentSourceId: string | null; // null = 全部來源
  setCurrentSource: (id: string | null) => void;
}

export const useSourceStore = create<SourceStore>()(
  persist(
    (set) => ({
      currentSourceId: null,
      setCurrentSource: (id) => set({ currentSourceId: id }),
    }),
    {
      name: 'token-dashboard-source',
    }
  )
);
