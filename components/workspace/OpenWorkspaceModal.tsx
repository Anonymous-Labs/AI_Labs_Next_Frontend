"use client";

import React, { useState } from "react";
import { X, FileText, Clock, HardDrive, Github, Upload, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaces, useCreateWorkspace } from "@/api/hooks/use-workspace";
import { getErrorMessage } from "@/lib/utils/error-handler";
import { Alert, AlertDescription } from "@/components/ui/alert";

type TabId = "examples" | "recent" | "drive" | "github" | "upload";

interface OpenWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWorkspace?: (workspace: { id: number; name: string }) => void;
  onCreateNew?: (workspace: { id: number; name: string }) => void;
}

export function OpenWorkspaceModal({ isOpen, onClose, onOpenWorkspace, onCreateNew }: OpenWorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("recent");
  const { data: workspaces, isLoading, error } = useWorkspaces();
  const createWorkspaceMutation = useCreateWorkspace();

  // Reset to Recent tab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab("recent");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { id: "examples" as TabId, label: "Examples", icon: FileText },
    { id: "recent" as TabId, label: "Recent", icon: Clock },
    { id: "drive" as TabId, label: "Google Drive", icon: HardDrive },
    { id: "github" as TabId, label: "GitHub", icon: Github },
    { id: "upload" as TabId, label: "Upload", icon: Upload },
  ];

  const exampleWorkspaces = [
    { id: "ex1", name: "Getting Started with ML", description: "Basic machine learning pipeline", type: "example" },
    { id: "ex2", name: "Data Preprocessing", description: "Clean and transform your data", type: "example" },
    { id: "ex3", name: "Neural Network Training", description: "Train deep learning models", type: "example" },
    { id: "ex4", name: "Time Series Analysis", description: "Analyze temporal data patterns", type: "example" },
  ];

  const recentWorkspaces = [
    { id: "rec1", name: "Customer Churn Analysis", description: "Last opened 2 hours ago", type: "recent" },
    { id: "rec2", name: "Sales Forecasting", description: "Last opened yesterday", type: "recent" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "examples":
        return (
          <div className="space-y-2">
            {exampleWorkspaces.map((ws) => (
              <div
                key={ws.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => {
                  onOpenWorkspace?.(ws.id);
                  onClose();
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{ws.name}</div>
                    <div className="text-xs text-muted-foreground">{ws.description}</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  Open
                </Button>
              </div>
            ))}
          </div>
        );

      case "recent":
        if (isLoading) {
          return (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          );
        }

        if (error) {
          return (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{getErrorMessage(error)}</AlertDescription>
            </Alert>
          );
        }

        return (
          <div className="space-y-2">
            {workspaces && workspaces.length > 0 ? (
              workspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => {
                    onOpenWorkspace?.({ id: ws.id, name: ws.name });
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{ws.name}</div>
                      <div className="text-xs text-muted-foreground">Workspace ID: {ws.id}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    Open
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-sm text-muted-foreground">No workspaces found. Create one to get started!</div>
            )}
          </div>
        );

      case "drive":
        return (
          <div className="text-center py-12">
            <HardDrive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Google Drive integration coming soon</p>
          </div>
        );

      case "github":
        return (
          <div className="text-center py-12">
            <Github className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">GitHub integration coming soon</p>
          </div>
        );

      case "upload":
        return (
          <div className="text-center py-12">
            <div className="border-2 border-dashed border-border rounded-lg p-8 max-w-md mx-auto">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-foreground mb-2">Upload workspace file</p>
              <p className="text-xs text-muted-foreground mb-4">Drag and drop or click to browse</p>
              <Button size="sm" variant="outline">
                Choose File
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Open workspace</h2>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border px-6">
          <div className="flex gap-1 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">{renderTabContent()}</div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {createWorkspaceMutation.error && (
              <Alert variant="destructive" className="mb-2">
                <AlertDescription>{getErrorMessage(createWorkspaceMutation.error)}</AlertDescription>
              </Alert>
            )}
            Select a workspace to open
          </div>
          <Button
            onClick={async () => {
              try {
                const newWorkspace = await createWorkspaceMutation.mutateAsync({ name: "Welcome to AI Labs" });
                onCreateNew?.(newWorkspace);
                onClose();
              } catch (error) {
                // Error is handled by the mutation state
                console.error("Failed to create workspace:", error);
              }
            }}
            disabled={createWorkspaceMutation.isPending}
            className="gap-2"
          >
            {createWorkspaceMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                New workspace
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

