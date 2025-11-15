/**
 * Workspace Store - Zustand store for workspace state management
 */

import { create } from "zustand";

export type SaveState = "idle" | "saving" | "saved" | "error";

export interface WorkspaceState {
  id: number | null;
  name: string;
  isNew: boolean;
  saveState: SaveState;
}

interface WorkspaceStore extends WorkspaceState {
  setWorkspace: (workspace: Partial<WorkspaceState>) => void;
  resetWorkspace: () => void;
  hasWorkspace: () => boolean;
  setSaveState: (state: SaveState) => void;
}

const initialState: WorkspaceState = {
  id: null,
  name: "Welcome to AI Labs",
  isNew: true,
  saveState: "idle",
};

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  ...initialState,

  setWorkspace: (workspace) =>
    set((state) => ({
      ...state,
      ...workspace,
    })),

  resetWorkspace: () => set(initialState),

  hasWorkspace: () => get().id !== null,

  setSaveState: (state) => set({ saveState: state }),
}));

