"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";

type WelcomeNodeData = {
  label?: string;
  content?: string;
};

export default function WelcomeNode({ data }: { data: WelcomeNodeData }) {
  return (
    <div className="rounded-lg border-2 bg-white from-primary/10 to-primary/5 shadow-lg min-w-[400px] max-w-[600px]">
      {/* Input handle on the left */}
      <Handle type="target" position={Position.Left} id="target" className="w-3 h-3 bg-primary" />
      
      <div className="p-5">
        <p className="text-sm text-foreground whitespace-pre-line leading-relaxed font-mono">
          {data?.label || data?.content || "Welcome"}
        </p>
      </div>
      
      {/* Output handle on the right */}
      <Handle type="source" position={Position.Right} id="source" className="w-3 h-3 bg-primary" />
    </div>
  );
}

