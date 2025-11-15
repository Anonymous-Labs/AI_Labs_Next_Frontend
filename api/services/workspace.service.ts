/**
 * Workspace Service - API calls for workspace management
 */

import { api } from "../axios";
import type { ApiResponse } from "@/types/api";

export interface Workspace {
  id: number;
  name: string;
}

export interface CreateWorkspaceInput {
  name: string;
}

export interface WorkspaceGraphData {
  nodes: unknown[];
  edges: unknown[];
}

export class WorkspaceService {
  /**
   * Get all workspaces for the current user
   */
  static async getWorkspaces(): Promise<Workspace[]> {
    const response = await api.get<Workspace[]>("/api/project/workspaces/");
    return response.data;
  }

  /**
   * Create a new workspace
   */
  static async createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    const response = await api.post<Workspace>("/api/project/workspaces/", input);
    return response.data;
  }

  /**
   * Get a specific workspace by ID
   */
  static async getWorkspace(id: number): Promise<Workspace> {
    const response = await api.get<Workspace>(`/api/project/workspaces/${id}/`);
    return response.data;
  }

  /**
   * Update a workspace
   */
  static async updateWorkspace(id: number, input: Partial<CreateWorkspaceInput>): Promise<Workspace> {
    const response = await api.patch<Workspace>(`/api/project/workspaces/${id}/`, input);
    return response.data;
  }

  /**
   * Delete a workspace
   */
  static async deleteWorkspace(id: number): Promise<void> {
    await api.delete(`/api/project/workspaces/${id}/`);
  }

  /**
   * Save workspace graph data (nodes and edges)
   */
  static async saveWorkspaceGraph(id: number, graphData: WorkspaceGraphData): Promise<void> {
    await api.patch(`/api/project/workspaces/${id}/`, { graph_data: graphData });
  }
}

