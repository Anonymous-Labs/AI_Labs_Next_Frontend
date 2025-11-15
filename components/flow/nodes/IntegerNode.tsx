"use client";

import React, { useCallback } from "react";
import { Handle, Position } from "@xyflow/react";
import { Input } from "@/components/ui/input";

export type IntegerNodeData = {
  label?: string;
  props?: { value?: number };
  // Provided by host canvas to update value from on-node editor
  onChange?: (next: number) => void;
};

export default function IntegerNode({ data }: { data: IntegerNodeData }) {
  const value = typeof data?.props?.value === "number" ? data.props.value : 0;

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.trim();
      const parsed = v === "" ? 0 : Number.parseInt(v, 10);
      if (!Number.isNaN(parsed)) {
        data?.onChange?.(parsed);
      }
    },
    [data]
  );

  return (
    <div className="rounded-md border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-xs font-medium text-foreground">{data?.label || "Integer"}</span>
        <span className="text-[10px] text-muted-foreground">int</span>
      </div>
      <div className="p-3">
        <Input
          type="number"
          inputMode="numeric"
          step={1}
          value={String(value)}
          onChange={onChange}
          className="h-8"
        />
      </div>

      {/* Single output handle on the right; can fan-out to many consumers */}
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}

export function IntegerInspector({ data, onChange }: { data: IntegerNodeData; onChange: (updater: (prev: IntegerNodeData) => IntegerNodeData) => void }) {
  const label = data?.label ?? "";
  const value = typeof data?.props?.value === "number" ? data.props.value : 0;
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
        <label className="mb-1 block text-[10px] text-muted-foreground">Value</label>
        <Input
          type="number"
          className="h-8"
          value={String(value)}
          onChange={(e) => {
            const v = e.target.value.trim();
            const parsed = v === "" ? 0 : Number.parseInt(v, 10);
            if (!Number.isNaN(parsed)) {
              onChange((prev) => ({ ...prev, props: { ...(prev.props || {}), value: parsed } }));
            }
          }}
        />
      </div>
    </div>
  );
}

export const integerNodeDefinition = {
  type: "integer",
  label: "Integer",
  getInitialData(): IntegerNodeData {
    return { label: "Integer", props: { value: 0 } };
  },
  Inspector: IntegerInspector,
  ports: {
    source: {
      out: { type: "int" },
    },
    target: {},
  },
};


