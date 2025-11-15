/**
 * Workspace-related constants and configurations
 */

import type { MenuType } from "@/types/workspace";
import {
  FileText,
  Clock,
  HardDrive,
  Github,
  Upload,
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
import type { LucideIcon } from "lucide-react";

export const DEFAULT_WORKSPACE_NAME = "Welcome to AI Labs";

export const MENU_ITEMS: MenuType[] = ["File", "Edit", "View", "Insert", "Runtime", "Tools", "Help"];

export interface MenuItemConfig {
  label: string;
  icon?: LucideIcon;
  action?: () => void;
  divider?: boolean;
}

export const FILE_MENU_ITEMS: MenuItemConfig[] = [
  { label: "New Workspace", icon: Plus },
  { label: "New from Template" },
  { label: "Open…" },
  { label: "Rename" },
  { divider: true },
  { label: "Make a copy" },
  { label: "Import graph (JSON)", icon: FileUp },
  { label: "Export graph (JSON)", icon: FileDown },
  { divider: true },
  { label: "Version history" },
  { label: "Publish workspace" },
  { label: "Page settings" },
];

export const VIEW_MENU_ITEMS: MenuItemConfig[] = [
  { label: "Zoom In", icon: ZoomIn },
  { label: "Zoom Out", icon: ZoomOut },
  { label: "Fit to Screen" },
  { divider: true },
  { label: "Toggle Palette", icon: PanelLeft },
  { label: "Toggle Inspector", icon: PanelRight },
  { label: "Toggle Grid", icon: Grid3X3 },
];

export const RUNTIME_MENU_ITEMS: MenuItemConfig[] = [
  { label: "Run all", icon: Play },
  { label: "Run selected" },
  { label: "Stop", icon: Square },
  { divider: true },
  { label: "Restart runtime" },
  { label: "Clear outputs" },
  { divider: true },
  { label: "Change runtime type…" },
  { label: "Manage sessions" },
];

export const TOOLS_MENU_ITEMS: MenuItemConfig[] = [
  { label: "Auto Layout", icon: LayoutGrid },
  { label: "Validate Graph" },
  { label: "Optimize Pipeline", icon: Wand2 },
  { divider: true },
  { label: "Generate Docs" },
  { label: "Manage Integrations" },
];

export const HELP_MENU_ITEMS: MenuItemConfig[] = [
  { label: "Documentation", icon: BookOpen },
  { label: "Keyboard Shortcuts" },
  { label: "Report an issue", icon: Bug },
];

export const OPEN_MODAL_TABS = [
  { id: "examples" as const, label: "Examples", icon: FileText },
  { id: "recent" as const, label: "Recent", icon: Clock },
  { id: "drive" as const, label: "Google Drive", icon: HardDrive },
  { id: "github" as const, label: "GitHub", icon: Github },
  { id: "upload" as const, label: "Upload", icon: Upload },
] as const;

export type OpenModalTabId = (typeof OPEN_MODAL_TABS)[number]["id"];

