"use client";

import React from "react";
import {
  Play,
  Square,
  Save,
  History,
  GitBranch,
  Upload,
  CalendarClock,
  Plus,
  LayoutGrid,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Eye,
  Cpu,
  Github,
  Users,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspace.store";

export function WorkspaceToolbar() {
  const { runtimeType } = useWorkspaceStore();

  return (
    <div className="flex h-10 items-center justify-between border-t border-border">
      <div className="flex items-center gap-1 py-1">
        <Button size="sm" variant="default" className="gap-1">
          <Play className="h-4 w-4" /> Run all
        </Button>
        <Button size="sm" variant="outline" className="gap-1">
          Run selected
        </Button>
        <Button size="sm" variant="outline" className="gap-1">
          <Square className="h-4 w-4" /> Stop
        </Button>
        <div className="mx-1 h-6 w-px bg-border" />
        <Button size="sm" variant="ghost" className="gap-1">
          <Save className="h-4 w-4" /> Save
        </Button>
        <Button size="sm" variant="ghost" className="gap-1">
          <History className="h-4 w-4" /> Version
        </Button>
        <Button size="sm" variant="ghost" className="gap-1">
          <GitBranch className="h-4 w-4" /> Branch
        </Button>
        <Button size="sm" variant="ghost" className="gap-1">
          <Upload className="h-4 w-4" /> Publish
        </Button>
        <Button size="sm" variant="ghost" className="gap-1">
          <CalendarClock className="h-4 w-4" /> Schedule
        </Button>
        <div className="mx-1 h-6 w-px bg-border" />
        <Button size="sm" variant="ghost" className="gap-1">
          <Plus className="h-4 w-4" /> Add Node
        </Button>
        <Button size="sm" variant="ghost" className="gap-1">
          <LayoutGrid className="h-4 w-4" /> Auto Layout
        </Button>
        <Button size="sm" variant="ghost" className="gap-1">
          <RotateCw className="h-4 w-4" /> Refresh
        </Button>
        <div className="mx-1 h-6 w-px bg-border" />
        <Button size="sm" variant="ghost" className="gap-1">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" className="gap-1">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" className="gap-1">
          <Eye className="h-4 w-4" /> Preview
        </Button>
      </div>
      <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
        <div className="flex items-center gap-1 rounded-md border border-border px-2 py-0.5">
          <Cpu className="h-3.5 w-3.5" /> {runtimeType}: idle
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border px-2 py-0.5">
          <Github className="h-3.5 w-3.5" /> Synced
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border px-2 py-0.5">
          <Users className="h-3.5 w-3.5" /> Collaborators
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border px-2 py-0.5">
          <HelpCircle className="h-3.5 w-3.5" /> Help
        </div>
      </div>
    </div>
  );
}

