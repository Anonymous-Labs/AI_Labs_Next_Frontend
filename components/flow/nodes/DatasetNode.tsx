"use client";

import React, { useCallback } from "react";
import { Handle, Position } from "@xyflow/react";
import { Input } from "@/components/ui/input";

export type DatasetNodeData = {
  label?: string;
  props?: { fileName?: string };
  onFileChange?: (fileName: string) => void;
};

export default function DatasetNode({ data }: { data: DatasetNodeData }) {
  const fileName = data?.props?.fileName || "";

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        data?.onFileChange?.(file.name);
        if (data?.props) {
          data.props.fileName = file.name; // Update the fileName in props
        }
      }
    },
    [data]
  );

  return (
    <div className="rounded-md border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-xs font-medium text-foreground">{data?.label || "Dataset"}</span>
        <span className="text-[10px] text-muted-foreground">file</span>
      </div>
      <div className="p-3 space-y-2">
        <Input type="file" className="h-8" onChange={onFileChange} />
        <div className="rounded bg-muted px-2 py-1 text-[10px] text-foreground break-all">
          {fileName || "No file selected"}
        </div>
      </div>

      {/* Single output handle on the right */}
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}

export function DatasetInspector({ data, onChange }: { data: DatasetNodeData; onChange: (updater: (prev: DatasetNodeData) => DatasetNodeData) => void }) {
  const label = data?.label ?? "";
  const fileName = data?.props?.fileName || "";
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
        <label className="mb-1 block text-[10px] text-muted-foreground">Selected File</label>
        <div className="rounded-md border border-border bg-muted/40 p-2 text-[10px] text-foreground break-all">
          {fileName || "No file selected"}
        </div>
      </div>
    </div>
  );
}

export const datasetNodeDefinition = {
  type: "dataset",
  label: "Dataset",
  getInitialData(): DatasetNodeData {
    return { label: "Dataset", props: { fileName: "" } };
  },
  Inspector: DatasetInspector,
};