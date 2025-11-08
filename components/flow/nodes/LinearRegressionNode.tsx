"use client";

import React, { useCallback } from "react";
import { Handle, Position } from "@xyflow/react";
import { Input } from "@/components/ui/input";

export type LinearRegressionNodeData = {
  label?: string;
  props?: { intercept?: number; normalize?: boolean };
  onChangeIntercept?: (next: number) => void;
  onChangeNormalize?: (next: boolean) => void;
};

export default function LinearRegressionNode({ data }: { data: LinearRegressionNodeData }) {
  const intercept = typeof data?.props?.intercept === "number" ? data.props.intercept : 0;
  const normalize = data?.props?.normalize ?? false;

  const onInterceptChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.trim();
      const parsed = v === "" ? 0 : Number.parseFloat(v);
      if (!Number.isNaN(parsed)) {
        data?.onChangeIntercept?.(parsed);
      }
    },
    [data]
  );

  const onNormalizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      data?.onChangeNormalize?.(e.target.checked);
    },
    [data]
  );

  return (
    <div className="rounded-md border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-xs font-medium text-foreground">{data?.label || "Linear Regression"}</span>
        <span className="text-[10px] text-muted-foreground">model</span>
      </div>
      <div className="p-3 space-y-2">
        <label className="text-[10px] text-muted-foreground">Intercept</label>
        <Input
          type="number"
          inputMode="decimal"
          step={0.1}
          value={String(intercept)}
          onChange={onInterceptChange}
          className="h-8"
        />
        <label className="text-[10px] text-muted-foreground flex items-center gap-2">
          <input
            type="checkbox"
            checked={normalize}
            onChange={onNormalizeChange}
          />
          Normalize
        </label>
      </div>

      {/* Input handles */}
      <Handle type="target" position={Position.Left} id="x" style={{ top: "30%" }} />
      <Handle type="target" position={Position.Left} id="y" style={{ top: "70%" }} />

      {/* Output handle */}
      <Handle type="source" position={Position.Right} id="model" style={{ top: "50%" }} />
    </div>
  );
}

export function LinearRegressionInspector({ data, onChange }: { data: LinearRegressionNodeData; onChange: (updater: (prev: LinearRegressionNodeData) => LinearRegressionNodeData) => void }) {
  const label = data?.label ?? "";
  const intercept = typeof data?.props?.intercept === "number" ? data.props.intercept : 0;
  const normalize = data?.props?.normalize ?? false;
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
        <label className="mb-1 block text-[10px] text-muted-foreground">Intercept</label>
        <Input
          type="number"
          className="h-8"
          value={String(intercept)}
          onChange={(e) => {
            const v = e.target.value.trim();
            const parsed = v === "" ? 0 : Number.parseFloat(v);
            if (!Number.isNaN(parsed)) {
              onChange((prev) => ({ ...prev, props: { ...(prev.props || {}), intercept: parsed } }));
            }
          }}
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] text-muted-foreground">Normalize</label>
        <input
          type="checkbox"
          checked={normalize}
          onChange={(e) => {
            onChange((prev) => ({ ...prev, props: { ...(prev.props || {}), normalize: e.target.checked } }));
          }}
        />
      </div>
    </div>
  );
}

export const linearRegressionNodeDefinition = {
  type: "linearRegression",
  label: "Linear Regression",
  getInitialData(): LinearRegressionNodeData {
    return { label: "Linear Regression", props: { intercept: 0, normalize: false } };
  },
  Inspector: LinearRegressionInspector,
};