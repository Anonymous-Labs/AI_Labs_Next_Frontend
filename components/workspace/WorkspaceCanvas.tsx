"use client";

import React from "react";
import {
  Background,
  BackgroundVariant,
  Panel,
  Controls,
  MiniMap,
  ReactFlow,
} from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelRight } from "lucide-react";
import { useCanvas } from "@/hooks/use-canvas";
import { Palette } from "./Palette";
import { Inspector } from "./Inspector";
import { useWorkspaceStore } from "@/store/workspace.store";
import { PALETTE_CATEGORIES } from "@/lib/workspace/paletteCategories";

interface WorkspaceCanvasProps {
  isNewWorkspace: boolean;
}

export function WorkspaceCanvas({ isNewWorkspace }: WorkspaceCanvasProps) {
  const { showPalette, setShowPalette } = useWorkspaceStore();
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    nodeTypes,
    selectedNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    onDrop,
    onDragOver,
    addNode,
    handleAutoLayout,
    updateNodeDataBy,
    zoomIn,
    zoomOut,
    fitView,
    setViewport,
  } = useCanvas({ isNewWorkspace });

  const handleDragStart = (item: { label: string; type?: string }) => (event: React.DragEvent) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify(item));
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      isValidConnection={isValidConnection}
      onDrop={onDrop}
      onDragOver={onDragOver}
      nodeTypes={nodeTypes}
      proOptions={{ hideAttribution: true }}
      fitView
      className="bg-background"
    >
      {/* Top Panel (toolbar) */}
      <Panel position="top-center" className="rounded-md border border-border bg-card/95 backdrop-blur px-3 py-2 shadow-sm flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => addNode("Dataset", "dataset")}>
          Add Dataset
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addNode("Processor")}>
          Add Processor
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addNode("Model")}>
          Add Model
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addNode("Metric", "output")}>
          Add Metric
        </Button>
        <div className="mx-2 h-5 w-px bg-border" />
        <Button size="sm" variant="outline" onClick={() => zoomIn({ duration: 200 })}>
          Zoom In
        </Button>
        <Button size="sm" variant="outline" onClick={() => zoomOut({ duration: 200 })}>
          Zoom Out
        </Button>
        <Button size="sm" variant="default" onClick={() => fitView({ padding: 0.2, duration: 400 })}>
          Fit
        </Button>
        <Button size="sm" variant="default" onClick={handleAutoLayout}>
          Auto Layout
        </Button>
      </Panel>

      {/* Left Panel (palette) */}
      {showPalette ? (
        <Panel position="top-left" className="m-3 w-72 rounded-md border border-border bg-card/95 backdrop-blur p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Palette (drag items to canvas)</p>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setShowPalette(false)} title="Collapse palette">
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
          <Palette categories={PALETTE_CATEGORIES} onDragStart={handleDragStart} />
        </Panel>
      ) : (
        <Panel position="top-left" className="m-3">
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowPalette(true)} title="Open palette">
            <PanelRight className="h-4 w-4" /> Palette
          </Button>
        </Panel>
      )}

      {/* Right Panel (inspector) */}
      <Panel position="top-right" className="m-3 w-72 rounded-md border border-border bg-card/95 backdrop-blur p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Inspector</p>
          {selectedNode && (
            <span className="text-[10px] text-muted-foreground">{selectedNode.type || "default"}</span>
          )}
        </div>
        <Inspector selectedNode={selectedNode} onUpdateNode={updateNodeDataBy} />
      </Panel>

      {/* Bottom Panel (quick actions) */}
      <Panel position="bottom-center" className="mb-3 rounded-md border border-border bg-card/95 backdrop-blur px-3 py-2 shadow-sm flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 })}>
          Reset View
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const a = addNode("Experiment");
            // addConnected would need to be implemented
          }}
        >
          Quick Experiment
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            setNodes([]);
            setEdges([]);
          }}
        >
          Clear
        </Button>
      </Panel>

      <Controls className="border-border bg-card shadow-sm" />
      <MiniMap className="border-border bg-card shadow-sm" />
      <Background variant={BackgroundVariant.Lines} gap={12} size={1} color="#dadce0" />
    </ReactFlow>
  );
}

