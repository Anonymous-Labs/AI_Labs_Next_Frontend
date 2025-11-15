"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Input } from "@/components/ui/input";

export type TextNodeData = {
  label?: string;
  props?: { value?: string | number };
};

export default function TextNode({ data }: { data: TextNodeData }) {
  const val = (data?.props?.value ?? "") as string | number;
  return (
    <div className="rounded-md border border-border bg-card shadow-sm min-w-48">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-xs font-medium text-foreground">{data?.label || "Text"}</span>
        <span className="text-[10px] text-muted-foreground">output</span>
      </div>
      <div className="p-3">
        <div className="rounded bg-muted px-2 py-1 text-xs text-foreground break-all">
          {String(val)}
        </div>
      </div>
      {/* Single input handle on the left */}
      <Handle type="target" position={Position.Left} id="in" />
    </div>
  );
}

export function TextInspector({ data, onChange }: { data: TextNodeData; onChange: (updater: (prev: TextNodeData) => TextNodeData) => void }) {
  const label = data?.label ?? "";
  const val = (data?.props?.value ?? "") as string | number;
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-[10px] text-muted-foreground">Label</label>
        <Input className="h-8" value={label} onChange={(e) => onChange((prev) => ({ ...prev, label: e.target.value }))} />
      </div>
      <div>
        <label className="mb-1 block text-[10px] text-muted-foreground">Current value</label>
        <div className="rounded-md border border-border bg-muted/40 p-2 text-[10px] text-foreground break-all">{String(val)}</div>
      </div>
    </div>
  );
}

export const textNodeDefinition = {
  type: "text",
  label: "Text",
  getInitialData(): TextNodeData {
    return { label: "Text", props: { value: "" } };
  },
  Inspector: TextInspector,
  ports: {
    source: {},
    target: {
      in: { type: "any" },
    },
  },
};


