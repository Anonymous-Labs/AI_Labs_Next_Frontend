"use client";

import React, { useCallback } from "react";
import { Handle, Position } from "@xyflow/react";
import { Input } from "@/components/ui/input";

export type TrainTestSplitNodeData = {
  label?: string;
  props?: { test_size?: number };
  onChange?: (next: number) => void;
};

export default function TrainTestSplitNode({ data }: { data: TrainTestSplitNodeData }) {
  const testSize = typeof data?.props?.test_size === "number" ? data.props.test_size : 0.2;

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.trim();
      const parsed = v === "" ? 0.2 : Number.parseFloat(v);
      if (!Number.isNaN(parsed)) {
        data?.onChange?.(parsed);
      }
    },
    [data]
  );

  return (
    <div className="rounded-md border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-xs font-medium text-foreground">{data?.label || "Train Test Split"}</span>
        <span className="text-[10px] text-muted-foreground">split</span>
      </div>
      <div className="p-3 space-y-2">
        <label className="text-[10px] text-muted-foreground">Test Size</label>
        <Input
          type="number"
          inputMode="decimal"
          step={0.1}
          value={String(testSize)}
          onChange={onChange}
          className="h-8"
        />
      </div>

      {/* Input handles */}
      <Handle type="target" position={Position.Left} id="x" style={{ top: "30%" }} />
      <Handle type="target" position={Position.Left} id="y" style={{ top: "70%" }} />

      {/* Output handles */}
      <Handle type="source" position={Position.Right} id="x_train" style={{ top: "20%" }} />
      <Handle type="source" position={Position.Right} id="y_train" style={{ top: "40%" }} />
      <Handle type="source" position={Position.Right} id="x_test" style={{ top: "60%" }} />
      <Handle type="source" position={Position.Right} id="y_test" style={{ top: "80%" }} />
    </div>
  );
}

export function TrainTestSplitInspector({ data, onChange }: { data: TrainTestSplitNodeData; onChange: (updater: (prev: TrainTestSplitNodeData) => TrainTestSplitNodeData) => void }) {
  const label = data?.label ?? "";
  const testSize = typeof data?.props?.test_size === "number" ? data.props.test_size : 0.2;
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-[10px] text-muted-foreground">Label</label>
        <Input
          className="h-8"
          value={label}
          onChange={(e) => onChange((prev) => ({ ...prev, label: e.target.value }))}
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] text-muted-foreground">Test Size</label>
        <Input
          type="number"
          className="h-8"
          value={String(testSize)}
          onChange={(e) => {
            const v = e.target.value.trim();
            const parsed = v === "" ? 0.2 : Number.parseFloat(v);
            if (!Number.isNaN(parsed)) {
              onChange((prev) => ({ ...prev, props: { ...(prev.props || {}), test_size: parsed } }));
            }
          }}
        />
      </div>
    </div>
  );
}

export const trainTestSplitNodeDefinition = {
  type: "trainTestSplit",
  label: "Train Test Split",
  getInitialData(): TrainTestSplitNodeData {
    return { label: "Train Test Split", props: { test_size: 0.2 } };
  },
  Inspector: TrainTestSplitInspector,
};