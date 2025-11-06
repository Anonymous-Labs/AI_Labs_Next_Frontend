"use client";

import React, { useCallback, useMemo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Input } from "@/components/ui/input";

export type Add2IntNodeData = {
  label?: string;
  props?: { a?: number; b?: number };
  locks?: { a?: boolean; b?: boolean };
  onChangeA?: (next: number) => void;
  onChangeB?: (next: number) => void;
};

export default function Add2IntNode({ data }: { data: Add2IntNodeData }) {
  const a = typeof data?.props?.a === "number" ? data.props.a : 0;
  const b = typeof data?.props?.b === "number" ? data.props.b : 0;
  const sum = useMemo(() => (Number.isFinite(a) && Number.isFinite(b) ? a + b : 0), [a, b]);

  const onChangeA = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    const parsed = v === "" ? 0 : Number.parseInt(v, 10);
    if (!Number.isNaN(parsed)) data?.onChangeA?.(parsed);
  }, [data]);

  const onChangeB = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    const parsed = v === "" ? 0 : Number.parseInt(v, 10);
    if (!Number.isNaN(parsed)) data?.onChangeB?.(parsed);
  }, [data]);

  return (
    <div className="rounded-md border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-xs font-medium text-foreground">{data?.label || "Add2Int"}</span>
        <span className="text-[10px] text-muted-foreground">a + b</span>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">A</span>
          <Input type="number" className="h-7" value={String(a)} onChange={onChangeA} disabled={Boolean(data?.locks?.a)} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">B</span>
          <Input type="number" className="h-7" value={String(b)} onChange={onChangeB} disabled={Boolean(data?.locks?.b)} />
        </div>
        <div className="rounded bg-muted px-2 py-1 text-[10px] text-foreground">Sum = {sum}</div>
      </div>

      {/* two inputs on left, one output on right */}
      <Handle type="target" position={Position.Left} id="in-a" style={{ top: 28 }} />
      <Handle type="target" position={Position.Left} id="in-b" style={{ top: 60 }} />
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}

export function Add2IntInspector({ data, onChange }: { data: Add2IntNodeData; onChange: (updater: (prev: Add2IntNodeData) => Add2IntNodeData) => void }) {
  const label = data?.label ?? "";
  const a = typeof data?.props?.a === "number" ? data.props.a : 0;
  const b = typeof data?.props?.b === "number" ? data.props.b : 0;
  const sum = (Number.isFinite(a) && Number.isFinite(b)) ? a + b : 0;
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-[10px] text-muted-foreground">Label</label>
        <Input className="h-8" value={label} onChange={(e) => onChange((prev) => ({ ...prev, label: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[10px] text-muted-foreground">A</label>
          <Input
            type="number"
            className="h-8"
            value={String(a)}
            disabled={Boolean(data?.locks?.a)}
            onChange={(e) => {
              const v = e.target.value.trim();
              const parsed = v === "" ? 0 : Number.parseInt(v, 10);
              if (!Number.isNaN(parsed)) onChange((prev) => ({ ...prev, props: { ...(prev.props || {}), a: parsed } }));
            }}
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-muted-foreground">B</label>
          <Input
            type="number"
            className="h-8"
            value={String(b)}
            disabled={Boolean(data?.locks?.b)}
            onChange={(e) => {
              const v = e.target.value.trim();
              const parsed = v === "" ? 0 : Number.parseInt(v, 10);
              if (!Number.isNaN(parsed)) onChange((prev) => ({ ...prev, props: { ...(prev.props || {}), b: parsed } }));
            }}
          />
        </div>
      </div>
      <div className="rounded bg-muted px-2 py-1 text-[10px] text-foreground">Sum = {sum}</div>
    </div>
  );
}

export const add2IntNodeDefinition = {
  type: "add2int",
  label: "Add2Int",
  getInitialData(): Add2IntNodeData {
    return { label: "Add2Int", props: { a: 0, b: 0 } };
  },
  Inspector: Add2IntInspector,
};


