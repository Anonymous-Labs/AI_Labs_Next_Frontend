"use client";

import React from "react";
import type { Node } from "@xyflow/react";
import { nodeDefinitions } from "@/lib/flow/nodeRegistry";

interface InspectorProps {
  selectedNode: Node | undefined;
  onUpdateNode: (id: string, updater: (prev: any) => any) => void;
}

export function Inspector({ selectedNode, onUpdateNode }: InspectorProps) {
  if (!selectedNode) {
    return (
      <div className="space-y-2 text-xs text-muted-foreground">
        <p>• Select a node to view its properties</p>
        <p>• Use Auto Layout to tidy your graph</p>
        <p>• Add nodes from the Palette</p>
      </div>
    );
  }

  const type = selectedNode.type as string | undefined;
  const def = type ? (nodeDefinitions as Record<string, any>)[type] : undefined;

  return (
    <div className="space-y-3">
      {def?.Inspector ? (
        <def.Inspector
          data={selectedNode.data}
          onChange={(updater) => onUpdateNode(selectedNode.id, updater)}
        />
      ) : (
        <div className="text-xs text-muted-foreground">No inspector available for this node.</div>
      )}

      <div>
        <label className="mb-1 block text-[10px] text-muted-foreground">Data</label>
        <div className="rounded-md border border-border bg-muted/40 p-2 text-[10px] text-foreground">
          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(selectedNode.data, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

