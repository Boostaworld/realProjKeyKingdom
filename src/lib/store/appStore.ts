import { create } from "zustand";

interface AppStore {
  expandedRow: string | null; // Currently expanded executor ID
  setExpandedRow: (id: string | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  expandedRow: null,
  setExpandedRow: (id) => set({ expandedRow: id }),
}));
