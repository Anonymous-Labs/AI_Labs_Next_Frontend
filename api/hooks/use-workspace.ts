/**
 * TanStack Query hooks for workspace operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkspaceService, type Workspace, type CreateWorkspaceInput } from "../services/workspace.service";

export const WORKSPACE_QUERY_KEYS = {
  all: ["workspaces"] as const,
  lists: () => [...WORKSPACE_QUERY_KEYS.all, "list"] as const,
  list: () => [...WORKSPACE_QUERY_KEYS.lists()] as const,
  details: () => [...WORKSPACE_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...WORKSPACE_QUERY_KEYS.details(), id] as const,
} as const;

/**
 * Get all workspaces
 */
export function useWorkspaces() {
  return useQuery({
    queryKey: WORKSPACE_QUERY_KEYS.list(),
    queryFn: () => WorkspaceService.getWorkspaces(),
  });
}

/**
 * Get a specific workspace
 */
export function useWorkspace(id: number | null) {
  return useQuery({
    queryKey: WORKSPACE_QUERY_KEYS.detail(id!),
    queryFn: () => WorkspaceService.getWorkspace(id!),
    enabled: id !== null,
  });
}

/**
 * Create a new workspace
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => WorkspaceService.createWorkspace(input),
    onSuccess: () => {
      // Invalidate workspaces list to refetch
      queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEYS.list() });
    },
  });
}

/**
 * Update a workspace
 */
export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CreateWorkspaceInput> }) =>
      WorkspaceService.updateWorkspace(id, input),
    onSuccess: (data) => {
      // Invalidate both list and specific workspace
      queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEYS.detail(data.id) });
    },
  });
}

/**
 * Delete a workspace
 */
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => WorkspaceService.deleteWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEYS.list() });
    },
  });
}

