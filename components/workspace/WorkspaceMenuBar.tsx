"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  FileUp,
  FileDown,
  ZoomIn,
  ZoomOut,
  PanelLeft,
  PanelRight,
  Grid3X3,
  Play,
  Square,
  LayoutGrid,
  Wand2,
  BookOpen,
  Bug,
} from "lucide-react";
import { MENU_ITEMS, FILE_MENU_ITEMS, VIEW_MENU_ITEMS, RUNTIME_MENU_ITEMS, TOOLS_MENU_ITEMS, HELP_MENU_ITEMS } from "@/lib/workspace/constants";
import { useWorkspaceStore } from "@/store/workspace.store";
import type { MenuType } from "@/types/workspace";

interface WorkspaceMenuBarProps {
  activeMenu: MenuType | null;
  onMenuChange: (menu: MenuType | null) => void;
  onOpenModal: () => void;
}

export function WorkspaceMenuBar({ activeMenu, onMenuChange, onOpenModal }: WorkspaceMenuBarProps) {
  const { setShowPalette } = useWorkspaceStore();

  const renderMenuContent = (label: MenuType) => {
    switch (label) {
      case "File":
        return (
          <div className="text-sm">
            <button
              className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2"
              onClick={() => {
                onOpenModal();
                onMenuChange(null);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> New Workspace
            </button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">New from Template</button>
            <button
              className="w-full rounded px-2 py-1.5 text-left hover:bg-muted"
              onClick={() => {
                onOpenModal();
                onMenuChange(null);
              }}
            >
              Open…
            </button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Rename</button>
            <div className="my-1 h-px bg-border" />
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Make a copy</button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2">
              <FileUp className="h-3.5 w-3.5" /> Import graph (JSON)
            </button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2">
              <FileDown className="h-3.5 w-3.5" /> Export graph (JSON)
            </button>
            <div className="my-1 h-px bg-border" />
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Version history</button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Publish workspace</button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Page settings</button>
          </div>
        );

      case "Edit":
        return (
          <div className="text-sm">
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Undo</button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Redo</button>
            <div className="my-1 h-px bg-border" />
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Cut</button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Copy</button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Paste</button>
            <div className="my-1 h-px bg-border" />
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Find/Replace</button>
          </div>
        );

      case "View":
        return (
          <div className="text-sm">
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2">
              <ZoomIn className="h-3.5 w-3.5" /> Zoom In
            </button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2">
              <ZoomOut className="h-3.5 w-3.5" /> Zoom Out
            </button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Fit to Screen</button>
            <div className="my-1 h-px bg-border" />
            <button
              className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2"
              onClick={() => {
                setShowPalette((v) => !v);
                onMenuChange(null);
              }}
            >
              <PanelLeft className="h-3.5 w-3.5" /> Toggle Palette
            </button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2">
              <PanelRight className="h-3.5 w-3.5" /> Toggle Inspector
            </button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2">
              <Grid3X3 className="h-3.5 w-3.5" /> Toggle Grid
            </button>
          </div>
        );

      case "Insert":
        return (
          <div className="text-sm">
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Node: Dataset</button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Node: Transformation</button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Node: Model</button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Node: Evaluation</button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Node: Deployment</button>
            <div className="my-1 h-px bg-border" />
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">From Template Gallery…</button>
          </div>
        );

      case "Runtime":
        return (
          <div className="text-sm">
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2">
              <Play className="h-3.5 w-3.5" /> Run all
            </button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Run selected</button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2">
              <Square className="h-3.5 w-3.5" /> Stop
            </button>
            <div className="my-1 h-px bg-border" />
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Restart runtime</button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Clear outputs</button>
            <div className="my-1 h-px bg-border" />
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Change runtime type…</button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Manage sessions</button>
          </div>
        );

      case "Tools":
        return (
          <div className="text-sm">
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2">
              <LayoutGrid className="h-3.5 w-3.5" /> Auto Layout
            </button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Validate Graph</button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2">
              <Wand2 className="h-3.5 w-3.5" /> Optimize Pipeline
            </button>
            <div className="my-1 h-px bg-border" />
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Generate Docs</button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Manage Integrations</button>
          </div>
        );

      case "Help":
        return (
          <div className="text-sm">
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" /> Documentation
            </button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Keyboard Shortcuts</button>
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2">
              <Bug className="h-3.5 w-3.5" /> Report an issue
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <nav className="ml-4 hidden items-center gap-1 md:flex" onMouseLeave={() => onMenuChange(null)}>
      {MENU_ITEMS.map((label) => (
        <div key={label} className="relative">
          <Button
            size="sm"
            variant="ghost"
            className={`px-2 text-sm ${activeMenu === label ? "bg-muted" : ""}`}
            onMouseEnter={() => onMenuChange(label)}
            onClick={() => onMenuChange(activeMenu === label ? null : label)}
          >
            {label}
          </Button>
          {activeMenu === label && (
            <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-md border border-border bg-card p-1 shadow-lg">
              {renderMenuContent(label)}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

