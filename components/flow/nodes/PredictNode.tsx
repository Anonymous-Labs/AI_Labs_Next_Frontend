"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";

export type PredictNodeData = {
  label?: string;
};

export default function PredictNode({ data }: { data: PredictNodeData }) {
  return (
    <div className="rounded-md border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-xs font-medium text-foreground">{data?.label || "Predict"}</span>
        <span className="text-[10px] text-muted-foreground">predict</span>
      </div>
      <div className="p-3">
        <p className="text-xs text-muted-foreground">Predict output (y) using model and input (x).</p>
      </div>

      {/* Input handles */}
      <Handle type="target" position={Position.Left} id="model" style={{ top: "30%" }} />
      <Handle type="target" position={Position.Left} id="x" style={{ top: "70%" }} />

      {/* Output handle */}
      <Handle type="source" position={Position.Right} id="y" style={{ top: "50%" }} />
    </div>
  );
}

export const predictNodeDefinition = {
  type: "predict",
  label: "Predict",
  getInitialData(): PredictNodeData {
    return { label: "Predict" };
  },
};