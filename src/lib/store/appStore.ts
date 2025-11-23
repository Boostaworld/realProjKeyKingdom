import { create } from "zustand";
import type { Platform, ExecutorCategory } from "@/types/executor";

interface FilterState {
  platformFilter: Platform[]; // e.g. ["windows", "mac"]
  categoryFilter: "all" | ExecutorCategory; // "all" | "reputable" | "suspicious"
  searchQuery: string; // free-text search
}

interface AppStore extends FilterState {
  setPlatformFilter: (platforms: Platform[]) => void;
  setCategoryFilter: (category: "all" | ExecutorCategory) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

const initialState: FilterState = {
  platformFilter: [],
  categoryFilter: "all",
  searchQuery: "",
};

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,

  setPlatformFilter: (platforms) =>
    set({ platformFilter: platforms }),

  setCategoryFilter: (category) =>
    set({ categoryFilter: category }),

  setSearchQuery: (query) =>
    set({ searchQuery: query }),

  resetFilters: () =>
    set(initialState),
}));
