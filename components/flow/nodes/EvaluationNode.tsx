"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";

export type EvaluationNodeData = {
  label?: string;
  accuracy?: number;
};

export default function EvaluationNode({ data }: { data: EvaluationNodeData }) {
  const accuracy = data?.accuracy ?? 0;

  return (
    <div className="rounded-md border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-xs font-medium text-foreground">{data?.label || "Evaluation"}</span>
        <span className="text-[10px] text-muted-foreground">eval</span>
      </div>
      <div className="p-3 space-y-2">
        <label className="text-[10px] text-muted-foreground">Accuracy</label>
        <div className="h-8 rounded-md border border-border bg-muted/40 p-2 text-xs text-foreground">
          {accuracy.toFixed(2)}
        </div>
      </div>

      {/* Input handles */}
      <Handle type="target" position={Position.Left} id="y_pred" style={{ top: "30%" }} />
      <Handle type="target" position={Position.Left} id="y" style={{ top: "70%" }} />
    </div>
  );
}

export const evaluationNodeDefinition = {
  type: "evaluation",
  label: "Evaluation",
  getInitialData(): EvaluationNodeData {
    return { label: "Evaluation", accuracy: 0 };
  },
};