"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Search,
  Share2,
  Cpu,
  Bell,
  MessageSquare,
  User,
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
  Github,
  Users,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import { WorkspaceMenuBar } from "./WorkspaceMenuBar";
import { WorkspaceToolbar } from "./WorkspaceToolbar";
import type { MenuType } from "@/types/workspace";

interface WorkspaceHeaderProps {
  activeMenu: MenuType | null;
  onMenuChange: (menu: MenuType | null) => void;
  onOpenModal: () => void;
  onSignOut: () => void;
}

export function WorkspaceHeader({
  activeMenu,
  onMenuChange,
  onOpenModal,
  onSignOut,
}: WorkspaceHeaderProps) {
  const { user } = useAuthStore();
  const { name: workspaceName, runtimeType, setRuntimeType } = useWorkspaceStore();
  const [accountOpen, setAccountOpen] = useState(false);
  const [runtimeOpen, setRuntimeOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background shadow-sm">
      <div className="mx-auto max-w-full px-2">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">AI</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <input
                  className="bg-transparent text-sm font-medium text-foreground outline-none focus:ring-0"
                  value={workspaceName}
                  onChange={(e) => useWorkspaceStore.getState().setWorkspace({ name: e.target.value })}
                  aria-label="Workspace name"
                />
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Workspace</span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Projects / Personal / <span className="text-foreground">{workspaceName}</span> • Auto-saved
              </div>
            </div>

            <WorkspaceMenuBar activeMenu={activeMenu} onMenuChange={onMenuChange} onOpenModal={onOpenModal} />
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="h-8 w-56 rounded-md border border-border bg-background pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                  placeholder="Search workspace"
                />
              </div>
              <Button size="sm" variant="outline" className="gap-1">
                <Share2 className="h-4 w-4" /> Share
              </Button>
              <div className="relative">
                <Button size="sm" variant="outline" className="gap-1" onClick={() => setRuntimeOpen((o) => !o)}>
                  <Cpu className="h-4 w-4" /> {runtimeType}
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {runtimeOpen && (
                  <div className="absolute right-0 z-30 mt-1 w-56 rounded-md border border-border bg-card p-1 shadow-lg">
                    {(["CPU", "GPU", "TPU"] as const).map((rt) => (
                      <button
                        key={rt}
                        className="w-full rounded px-2 py-1.5 text-left hover:bg-muted"
                        onClick={() => {
                          setRuntimeType(rt);
                          setRuntimeOpen(false);
                        }}
                      >
                        {rt}
                      </button>
                    ))}
                    <div className="my-1 h-px bg-border" />
                    <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Manage runtimes…</button>
                  </div>
                )}
              </div>
              <Button size="sm" variant="ghost" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" aria-label="Comments">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Button size="sm" variant="ghost" className="gap-1" onClick={() => setAccountOpen((o) => !o)}>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
              {accountOpen && (
                <div className="absolute right-0 z-30 mt-1 w-60 rounded-md border border-border bg-card p-1 shadow-lg">
                  <div className="px-2 py-2 text-xs text-muted-foreground">
                    {user ? (user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user.email) : "Guest"}
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Profile</button>
                  <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Settings</button>
                  <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Keyboard Shortcuts</button>
                  <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Billing</button>
                  <div className="my-1 h-px bg-border" />
                  <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted" onClick={onSignOut}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <WorkspaceToolbar />
      </div>
    </header>
  );
}

