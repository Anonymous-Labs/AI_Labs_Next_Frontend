"use client";

/**
 * Workspace Page - Main entry point for the AI Labs workspace
 * Refactored for enterprise-level code quality
 */

import React, { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { AuthGuard } from "@/components/providers/AuthGuard";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { OpenWorkspaceModal } from "@/components/workspace/OpenWorkspaceModal";
import { useAuthStore } from "@/store/auth.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useWorkspaceManagement } from "@/hooks/use-workspace-management";
import type { MenuType } from "@/types/workspace";

export default function WorkspacePage() {
  const { signOut } = useAuthStore();
  const { isNew: isNewWorkspace } = useWorkspaceStore();
  const { handleOpenWorkspace, handleCreateWorkspace } = useWorkspaceManagement();
  const [activeMenu, setActiveMenu] = useState<MenuType | null>(null);
  const [openModalOpen, setOpenModalOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen w-screen flex-col bg-background">
        <WorkspaceHeader
          activeMenu={activeMenu}
          onMenuChange={setActiveMenu}
          onOpenModal={() => setOpenModalOpen(true)}
          onSignOut={signOut}
        />

        <div className="flex-1 overflow-hidden">
          <ReactFlowProvider>
            <WorkspaceCanvas isNewWorkspace={isNewWorkspace} />
          </ReactFlowProvider>
        </div>

        <OpenWorkspaceModal
          isOpen={openModalOpen}
          onClose={() => setOpenModalOpen(false)}
          onOpenWorkspace={(workspace) => {
            handleOpenWorkspace(workspace);
            setOpenModalOpen(false);
          }}
          onCreateNew={(workspace) => {
            handleCreateWorkspace(workspace);
            setOpenModalOpen(false);
          }}
        />
      </div>
    </AuthGuard>
  );
}

