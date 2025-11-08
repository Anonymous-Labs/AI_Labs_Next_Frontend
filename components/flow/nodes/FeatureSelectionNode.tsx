import React, { useCallback } from "react";
import { Handle, Position } from "@xyflow/react";
import { Input } from "@/components/ui/input";

export type FeatureSelectionNodeData = {
  label?: string;
  props?: {
    targetColumn?: string;
    featureColumns?: string;
  };
  onTargetColumnChange?: (targetColumn: string) => void;
  onFeatureColumnsChange?: (featureColumns: string) => void;
};

export default function FeatureSelectionNode({ data }: { data: FeatureSelectionNodeData }) {
  const targetColumn = data?.props?.targetColumn || "";
  const featureColumns = data?.props?.featureColumns || "";

  const onTargetColumnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      data?.onTargetColumnChange?.(value);
      if (data?.props) {
        data.props.targetColumn = value;
      }
    },
    [data]
  );

  const onFeatureColumnsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      data?.onFeatureColumnsChange?.(value);
      if (data?.props) {
        data.props.featureColumns = value;
      }
    },
    [data]
  );

  return (
    <div className="rounded-md border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-xs font-medium text-foreground">{data?.label || "Feature Selection"}</span>
        <span className="text-[10px] text-muted-foreground">columns</span>
      </div>
      <div className="p-3 space-y-2">
        <div>
          <label className="text-[10px] text-muted-foreground">Target Column</label>
          <Input
            type="text"
            className="h-8"
            value={targetColumn}
            onChange={onTargetColumnChange}
            placeholder="Enter target column"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground">Feature Columns</label>
          <Input
            type="text"
            className="h-8"
            value={featureColumns}
            onChange={onFeatureColumnsChange}
            placeholder="Enter feature columns"
          />
        </div>
      </div>

      {/* Input handle on the left */}
      <Handle type="target" position={Position.Left} id="in" />

      {/* Output handles on the right */}
      <Handle type="source" position={Position.Right} id="out-target" style={{ top: "30%" }} />
      <Handle type="source" position={Position.Right} id="out-features" style={{ top: "70%" }} />
    </div>
  );
}

export function FeatureSelectionInspector({
  data,
  onChange,
}: {
  data: FeatureSelectionNodeData;
  onChange: (updater: (prev: FeatureSelectionNodeData) => FeatureSelectionNodeData) => void;
}) {
  const label = data?.label ?? "";
  const targetColumn = data?.props?.targetColumn || "";
  const featureColumns = data?.props?.featureColumns || "";

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
        <label className="mb-1 block text-[10px] text-muted-foreground">Target Column</label>
        <Input
          className="h-8"
          value={targetColumn}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              props: { ...prev.props, targetColumn: e.target.value },
            }))
          }
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] text-muted-foreground">Feature Columns</label>
        <Input
          className="h-8"
          value={featureColumns}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              props: { ...prev.props, featureColumns: e.target.value },
            }))
          }
        />
      </div>
    </div>
  );
}

export const featureSelectionNodeDefinition = {
  type: "featureSelection",
  label: "Feature Selection",
  getInitialData(): FeatureSelectionNodeData {
    return { label: "Feature Selection", props: { targetColumn: "", featureColumns: "" } };
  },
  Inspector: FeatureSelectionInspector,
};