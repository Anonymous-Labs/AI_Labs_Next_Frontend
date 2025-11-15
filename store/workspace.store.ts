/**
 * Zustand store for workspace state management
 */

import { create } from "zustand";
import type { WorkspaceState, RuntimeType } from "@/types/workspace";

interface WorkspaceStore extends WorkspaceState {
  runtimeType: RuntimeType;
  showPalette: boolean;
  showInspector: boolean;
  
  // Actions
  setWorkspace: (workspace: Partial<WorkspaceState>) => void;
  setRuntimeType: (type: RuntimeType) => void;
  setShowPalette: (show: boolean) => void;
  setShowInspector: (show: boolean) => void;
  resetWorkspace: () => void;
}

const initialState: Omit<WorkspaceStore, keyof WorkspaceStore> & {
  id: number | null;
  name: string;
  isNew: boolean;
  runtimeType: RuntimeType;
  showPalette: boolean;
  showInspector: boolean;
} = {
  id: null,
  name: "Welcome to AI Labs",
  isNew: true,
  runtimeType: "GPU",
  showPalette: true,
  showInspector: true,
};

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  ...initialState,

  setWorkspace: (workspace) =>
    set((state) => ({
      ...state,
      ...workspace,
    })),

  setRuntimeType: (type) => set({ runtimeType: type }),

  setShowPalette: (show) => set({ showPalette: show }),

  setShowInspector: (show) => set({ showInspector: show }),

  resetWorkspace: () => set(initialState),
}));

