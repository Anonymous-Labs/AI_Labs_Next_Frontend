/**
 * Workspace-related type definitions
 */

import type { Node, Edge } from "@xyflow/react";

export type MenuType = "File" | "Edit" | "View" | "Insert" | "Runtime" | "Tools" | "Help";
export type RuntimeType = "CPU" | "GPU" | "TPU";

export interface WorkspaceState {
  id: number | null;
  name: string;
  isNew: boolean;
}

export interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
}

export interface WorkspaceGraph {
  nodes: Node[];
  edges: Edge[];
}

export interface WelcomeNodeData {
  label: string;
  content: string;
}

