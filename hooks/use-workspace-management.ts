/**
 * Custom hooks for workspace management
 */

import { useCallback } from "react";
import { useWorkspaceStore } from "@/store/workspace.store";
import type { Workspace } from "@/api/services/workspace.service";

/**
 * Hook for managing workspace operations
 */
export function useWorkspaceManagement() {
  const { setWorkspace, resetWorkspace } = useWorkspaceStore();

  const handleOpenWorkspace = useCallback(
    (workspace: Workspace) => {
      setWorkspace({
        id: workspace.id,
        name: workspace.name,
        isNew: false,
      });
    },
    [setWorkspace]
  );

  const handleCreateWorkspace = useCallback(
    (workspace: Workspace) => {
      setWorkspace({
        id: workspace.id,
        name: workspace.name,
        isNew: true,
      });
    },
    [setWorkspace]
  );

  const handleNewWorkspace = useCallback(() => {
    resetWorkspace();
  }, [resetWorkspace]);

  return {
    handleOpenWorkspace,
    handleCreateWorkspace,
    handleNewWorkspace,
  };
}

