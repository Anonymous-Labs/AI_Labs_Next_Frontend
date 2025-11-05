"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { AuthGuard } from "@/components/providers/AuthGuard";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import "@xyflow/react/dist/style.css";

const initialNodes: Node[] = [
  { id: "n1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
  { id: "n2", position: { x: 0, y: 100 }, data: { label: "Node 2" } },
];

const initialEdges: Edge[] = [{ id: "n1-n2", source: "n1", target: "n2" }];

/**
 * Workspace Page - React Flow Canvas
 * Main workspace for AI development with node-based editing
 */
export default function WorkspacePage() {
  const { signOut, user } = useAuthStore();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const nodeTypes = useMemo(() => ({}), []);
  const edgeTypes = useMemo(() => ({}), []);

  return (
    <AuthGuard>
      <div className="flex h-screen w-screen flex-col bg-background">
        <header className="border-b border-border bg-background shadow-sm">
          <div className="mx-auto flex h-16 max-w-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">AI</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">AI Lab Workspace</h1>
                {user && (
                  <p className="text-xs text-muted-foreground">
                    {user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user.email}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign out
              </Button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            proOptions={{ hideAttribution: true }}
            fitView
            className="bg-background"
          >
            <Controls className="border-border bg-card shadow-sm" />
            <MiniMap className="border-border bg-card shadow-sm" />
            <Background variant={BackgroundVariant.Lines} gap={12} size={1} color="#dadce0" />
          </ReactFlow>
        </div>
      </div>
    </AuthGuard>
  );
}
